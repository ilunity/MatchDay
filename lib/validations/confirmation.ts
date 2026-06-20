import { z } from "zod";

export const confirmationModeSchema = z.enum(["all", "one_of"]);

export const setEventConfirmationSchema = z.object({
  slug: z.string().min(1),
  confirmedDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

export type ConfirmationMode = z.infer<typeof confirmationModeSchema>;
export type SetEventConfirmationInput = z.infer<
  typeof setEventConfirmationSchema
>;
