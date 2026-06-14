import { nanoid } from "nanoid";
import type { HydratedDocument } from "mongoose";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_COVER_SIZE,
  deleteObject,
  uploadObject,
} from "@/lib/minio";
import type { IUser } from "@/models/User";

export type AvatarUploadError = "invalid_type" | "too_large" | null;

export function validateAvatarFile(file: File): AvatarUploadError {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return "invalid_type";
  }
  if (file.size > MAX_COVER_SIZE) {
    return "too_large";
  }
  return null;
}

export async function removeUserAvatar(user: HydratedDocument<IUser>): Promise<void> {
  if (!user.avatarKey) return;

  try {
    await deleteObject(user.avatarKey);
  } catch {
    // ignore delete errors
  }

  user.avatarKey = undefined;
  await user.save();
}

export async function saveUserAvatar(
  user: HydratedDocument<IUser>,
  file: File
): Promise<AvatarUploadError> {
  const validationError = validateAvatarFile(file);
  if (validationError) return validationError;

  const ext = file.type.split("/")[1] ?? "jpg";
  const key = `avatars/${user._id.toString()}/${nanoid()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (user.avatarKey) {
    try {
      await deleteObject(user.avatarKey);
    } catch {
      // ignore delete errors
    }
  }

  await uploadObject(key, buffer, file.type);
  user.avatarKey = key;
  await user.save();

  return null;
}

export async function applyAvatarFromFormData(
  user: HydratedDocument<IUser>,
  formData: FormData
): Promise<AvatarUploadError> {
  if (formData.get("removeAvatar") === "on") {
    await removeUserAvatar(user);
    return null;
  }

  const file = formData.get("avatar");
  if (file instanceof File && file.size > 0) {
    return saveUserAvatar(user, file);
  }

  return null;
}

export function avatarUrlFromKey(avatarKey?: string | null): string | undefined {
  if (!avatarKey) return undefined;
  return `/api/storage/${avatarKey}`;
}
