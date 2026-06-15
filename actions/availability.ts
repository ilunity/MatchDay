"use server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import {
  mergeAvailabilityOnSave,
  filterAvailabilityForCalendar,
} from "@/lib/availability-dates";
import { dateKey } from "@/lib/dates";
import {
  createGuestId,
  getGuestId,
  getGuestName,
  setGuestCookies,
} from "@/lib/guest";
import {
  setAvailabilitySchema,
  setGuestNameSchema,
} from "@/lib/validations/availability";
import { Availability, type IAvailability } from "@/models/Availability";
import { Event, type IEvent } from "@/models/Event";
import { type IUser } from "@/models/User";
import { revalidatePath } from "next/cache";

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function setAvailability(
  formData: FormData
): Promise<ActionResult> {
  const eventSlug = String(formData.get("eventSlug") ?? "");
  const rawDates = formData.getAll("availableDates").map(String);

  const parsed = setAvailabilitySchema.safeParse({
    eventId: String(formData.get("eventId") ?? ""),
    availableDates: rawDates,
  });

  if (!parsed.success) {
    return { success: false, error: "Проверьте выбранные даты" };
  }

  await connectDB();
  const eventDoc = await Event.findOne({ slug: eventSlug }).lean<IEvent>();
  if (!eventDoc) {
    return { success: false, error: "Мероприятие не найдено" };
  }
  const event = eventDoc;

  const session = await auth();
  const possibleSet = new Set(
    event.possibleDates.map((d) => dateKey(new Date(d)))
  );

  const selectedKeys = parsed.data.availableDates.filter((d) =>
    possibleSet.has(d)
  );

  if (event.requireAuth && !session?.user?.id) {
    return { success: false, error: "Необходима авторизация" };
  }

  if (session?.user?.id) {
    const { User } = await import("@/models/User");
    const user = await User.findById(session.user.id).lean<IUser>();
    if (!user?.name?.trim()) {
      return { success: false, error: "Укажите имя в профиле" };
    }

    const existing = await Availability.findOne({
      eventId: event._id,
      userId: session.user.id,
    }).lean<IAvailability>();

    const availableDates = mergeAvailabilityOnSave(
      existing?.availableDates ?? [],
      selectedKeys,
      possibleSet
    );

    await Availability.findOneAndUpdate(
      { eventId: event._id, userId: session.user.id },
      { availableDates },
      { upsert: true, new: true }
    );
  } else {
    const guestId = (await getGuestId()) ?? createGuestId();
    const guestName = (await getGuestName()) ?? "Гость";

    if (!(await getGuestId())) {
      await setGuestCookies(guestId, guestName);
    }

    const existing = await Availability.findOne({
      eventId: event._id,
      guestId,
    }).lean<IAvailability>();

    const availableDates = mergeAvailabilityOnSave(
      existing?.availableDates ?? [],
      selectedKeys,
      possibleSet
    );

    await Availability.findOneAndUpdate(
      { eventId: event._id, guestId },
      { availableDates, guestName },
      { upsert: true, new: true }
    );
  }

  revalidatePath(`/e/${eventSlug}`);
  if (session?.user?.id) {
    revalidatePath("/dashboard");
  }
  return { success: true };
}

export async function setGuestName(
  formData: FormData
): Promise<ActionResult> {
  const parsed = setGuestNameSchema.safeParse({
    eventSlug: formData.get("eventSlug"),
    guestName: formData.get("guestName"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Введите имя",
    };
  }

  await connectDB();
  const eventDoc = await Event.findOne({ slug: parsed.data.eventSlug }).lean<IEvent>();
  if (!eventDoc) {
    return { success: false, error: "Мероприятие не найдено" };
  }
  const event = eventDoc;

  const guestId = createGuestId();
  await setGuestCookies(guestId, parsed.data.guestName);

  await Availability.findOneAndUpdate(
    { eventId: event._id, guestId },
    { guestName: parsed.data.guestName, availableDates: [] },
    { upsert: true, new: true }
  );

  revalidatePath(`/e/${parsed.data.eventSlug}`);
  return { success: true };
}

export async function getUserAvailability(eventId: string) {
  await connectDB();
  const session = await auth();

  let availableDates: Date[] = [];

  if (session?.user?.id) {
    const av = await Availability.findOne({
      eventId,
      userId: session.user.id,
    }).lean<IAvailability>();
    availableDates = av?.availableDates ?? [];
  } else {
    const guestId = await getGuestId();
    if (guestId) {
      const av = await Availability.findOne({
        eventId,
        guestId,
      }).lean<IAvailability>();
      availableDates = av?.availableDates ?? [];
    }
  }

  const event = await Event.findById(eventId).lean<IEvent>();
  if (!event) return availableDates;

  const possibleSet = new Set(
    event.possibleDates.map((d) => dateKey(new Date(d)))
  );

  return filterAvailabilityForCalendar(availableDates, possibleSet);
}
