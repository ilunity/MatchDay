import { z } from "zod";

export const setAvailabilitySchema = z.object({
  eventId: z.string().min(1),
  availableDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

export const setGuestNameSchema = z.object({
  eventSlug: z.string().min(1),
  guestName: z.string().min(1, "Введите имя").max(100),
});

export type SetAvailabilityInput = z.infer<typeof setAvailabilitySchema>;
export type SetGuestNameInput = z.infer<typeof setGuestNameSchema>;
