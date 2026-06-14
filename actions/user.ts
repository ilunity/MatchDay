"use server";

import { auth } from "@/lib/auth";
import {
  applyAvatarFromFormData,
  type AvatarUploadError,
} from "@/lib/avatar";
import { connectDB } from "@/lib/db";
import { updateUserNameSchema } from "@/lib/validations/user";
import { User } from "@/models/User";
import { revalidatePath } from "next/cache";

export type ActionResult = {
  success: boolean;
  error?: string;
  name?: string;
  avatarKey?: string | null;
};

function avatarErrorMessage(error: AvatarUploadError): string {
  if (error === "invalid_type") return "Допустимы только JPEG, PNG и WebP";
  if (error === "too_large") return "Файл слишком большой (максимум 5 МБ)";
  return "Ошибка загрузки аватара";
}

export async function updateUserName(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Необходима авторизация" };
  }

  const parsed = updateUserNameSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Введите имя",
    };
  }

  await connectDB();

  const user = await User.findById(session.user.id);
  if (!user) {
    return { success: false, error: "Пользователь не найден" };
  }

  user.name = parsed.data.name;
  await user.save();

  const avatarError = await applyAvatarFromFormData(user, formData);
  if (avatarError) {
    return { success: false, error: avatarErrorMessage(avatarError) };
  }

  revalidatePath("/", "layout");
  revalidatePath("/profile");
  return {
    success: true,
    name: parsed.data.name,
    avatarKey: user.avatarKey ?? null,
  };
}
