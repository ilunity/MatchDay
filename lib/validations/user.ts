import { z } from "zod";

export const updateUserNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Введите имя")
    .max(100, "Имя слишком длинное"),
});

export type UpdateUserNameInput = z.infer<typeof updateUserNameSchema>;
