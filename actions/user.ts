"use server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { updateUserNameSchema } from "@/lib/validations/user";
import { User } from "@/models/User";
import { revalidatePath } from "next/cache";

export type ActionResult = {
  success: boolean;
  error?: string;
  name?: string;
};

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
  await User.findByIdAndUpdate(session.user.id, { name: parsed.data.name });

  revalidatePath("/", "layout");
  return { success: true, name: parsed.data.name };
}
