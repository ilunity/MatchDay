"use server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { dateKey, parseDateKey } from "@/lib/dates";
import { applyCoverFromFormData, type CoverUploadError } from "@/lib/cover";
import { createEventSchema, updateEventSchema } from "@/lib/validations/event";
import { Event, type IEvent } from "@/models/Event";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ActionResult = {
  success: boolean;
  error?: string;
  slug?: string;
};

function coverErrorMessage(error: CoverUploadError): string {
  if (error === "invalid_type") return "Допустимы только JPEG, PNG и WebP";
  if (error === "too_large") return "Файл слишком большой (максимум 5 МБ)";
  return "Ошибка загрузки обложки";
}

export async function createEvent(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Необходима авторизация" };
  }

  const rawDates = formData.getAll("possibleDates").map(String);
  const parsed = createEventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    requireAuth: formData.get("requireAuth") === "on",
    possibleDates: rawDates,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Ошибка валидации",
    };
  }

  await connectDB();

  const slug = nanoid(10);
  const possibleDates = parsed.data.possibleDates.map(parseDateKey);

  const event = await Event.create({
    slug,
    title: parsed.data.title,
    description: parsed.data.description,
    ownerId: session.user.id,
    possibleDates,
    requireAuth: parsed.data.requireAuth,
  });

  const coverError = await applyCoverFromFormData(event, formData);
  if (coverError) {
    return { success: false, error: coverErrorMessage(coverError) };
  }

  revalidatePath("/dashboard");
  redirect(`/e/${slug}`);
}

export async function updateEvent(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Необходима авторизация" };
  }

  const rawDates = formData.getAll("possibleDates").map(String);
  const parsed = updateEventSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    requireAuth: false,
    possibleDates: rawDates,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Ошибка валидации",
    };
  }

  await connectDB();

  const event = await Event.findOne({ slug: parsed.data.slug });
  if (!event) {
    return { success: false, error: "Мероприятие не найдено" };
  }

  if (event.ownerId.toString() !== session.user.id) {
    return { success: false, error: "Нет доступа" };
  }

  event.title = parsed.data.title;
  event.description = parsed.data.description;
  event.possibleDates = parsed.data.possibleDates.map(parseDateKey);
  await event.save();

  const coverError = await applyCoverFromFormData(event, formData);
  if (coverError) {
    return { success: false, error: coverErrorMessage(coverError) };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/e/${parsed.data.slug}`);
  revalidatePath(`/events/${parsed.data.slug}/edit`);
  redirect(`/e/${parsed.data.slug}`);
}

export async function getEventForOwner(slug: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  await connectDB();
  const event = await Event.findOne({ slug }).lean<IEvent>();
  if (!event || event.ownerId.toString() !== session.user.id) {
    return null;
  }

  return event;
}

export async function getUserEvents() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  await connectDB();
  return Event.find({ ownerId: session.user.id })
    .sort({ createdAt: -1 })
    .lean<IEvent[]>();
}

export async function getEventBySlug(slug: string) {
  await connectDB();
  return Event.findOne({ slug }).lean<IEvent>();
}

export async function getEventStats(slug: string) {
  await connectDB();
  const event = await Event.findOne({ slug }).lean<IEvent>();
  if (!event) return null;

  const { Availability } = await import("@/models/Availability");
  const availabilities = await Availability.find({
    eventId: event._id,
  }).lean();

  const possibleSet = new Set(
    event.possibleDates.map((d) => dateKey(new Date(d)))
  );

  const dateCounts = new Map<string, number>();

  for (const av of availabilities) {
    for (const date of av.availableDates) {
      const key = dateKey(new Date(date));
      if (possibleSet.has(key)) {
        dateCounts.set(key, (dateCounts.get(key) ?? 0) + 1);
      }
    }
  }

  const stats = Array.from(dateCounts.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => b.count - a.count || a.date.localeCompare(b.date));

  return {
    event,
    stats,
    totalParticipants: availabilities.length,
  };
}
