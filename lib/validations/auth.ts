import { z } from "zod";

const usernameRegex = /^[a-z0-9_]{3,30}$/;

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(usernameRegex, "Логин: 3–30 символов, латиница, цифры и _");

export const passwordSchema = z
  .string()
  .min(8, "Пароль: минимум 8 символов")
  .max(128, "Пароль слишком длинный")
  .regex(/[a-zA-Z]/, "Пароль должен содержать букву")
  .regex(/[0-9]/, "Пароль должен содержать цифру");

export const registerPasswordSchema = z
  .object({
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    name: z
      .string()
      .trim()
      .min(1, "Введите имя")
      .max(100, "Имя слишком длинное"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => data.username.toLowerCase() !== data.name.trim().toLowerCase(),
    {
      message: "Логин не должен совпадать с именем",
      path: ["username"],
    }
  );

export const credentialsLoginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, "Введите пароль"),
});

export const setPasswordSchema = z
  .object({
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export const linkEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Введите корректный email"),
});

export type RegisterPasswordInput = z.infer<typeof registerPasswordSchema>;
export type CredentialsLoginInput = z.infer<typeof credentialsLoginSchema>;
export type SetPasswordInput = z.infer<typeof setPasswordSchema>;
export type LinkEmailInput = z.infer<typeof linkEmailSchema>;
