"use server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { parseDateKey } from "@/lib/dates";
import { createEventSchema } from "@/lib/validations/event";
import { Event, type IEvent } from "@/models/Event";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ActionResult = {
  success: boolean;
  error?: string;
  slug?: string;
};

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

  await Event.create({
    slug,
    title: parsed.data.title,
    description: parsed.data.description,
    ownerId: session.user.id,
    possibleDates,
    requireAuth: parsed.data.requireAuth,
  });

  revalidatePath("/dashboard");
  redirect(`/e/${slug}`);
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
    event.possibleDates.map((d) => new Date(d).toISOString().slice(0, 10))
  );

  const dateCounts = new Map<string, number>();

  for (const av of availabilities) {
    for (const date of av.availableDates) {
      const key = new Date(date).toISOString().slice(0, 10);
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
