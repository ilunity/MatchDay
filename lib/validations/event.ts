import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1, "Укажите название").max(200),
  description: z.string().max(2000).optional(),
  requireAuth: z.boolean().default(false),
  possibleDates: z
    .array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .min(1, "Выберите хотя бы одну дату"),
});

export const updateEventSchema = createEventSchema.extend({
  slug: z.string().min(1),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
