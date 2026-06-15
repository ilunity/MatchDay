import { nanoid } from "nanoid";
import type { HydratedDocument } from "mongoose";
import { validateImageFile, type ImageValidationError } from "@/lib/image-constants";
import { deleteObject, uploadObject } from "@/lib/minio";
import type { IEvent } from "@/models/Event";

export type CoverUploadError = ImageValidationError;

export function validateCoverFile(file: File): CoverUploadError {
  return validateImageFile(file);
}

export async function removeEventCover(
  event: HydratedDocument<IEvent>
): Promise<void> {
  if (!event.coverImageKey) return;

  try {
    await deleteObject(event.coverImageKey);
  } catch {
    // ignore delete errors
  }

  event.coverImageKey = undefined;
  await event.save();
}

export async function saveEventCover(
  event: HydratedDocument<IEvent>,
  file: File
): Promise<CoverUploadError> {
  const validationError = validateCoverFile(file);
  if (validationError) return validationError;

  const ext = file.type.split("/")[1] ?? "jpg";
  const key = `covers/${event._id.toString()}/${nanoid()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (event.coverImageKey) {
    try {
      await deleteObject(event.coverImageKey);
    } catch {
      // ignore delete errors
    }
  }

  await uploadObject(key, buffer, file.type);
  event.coverImageKey = key;
  await event.save();

  return null;
}

export async function applyCoverFromFormData(
  event: HydratedDocument<IEvent>,
  formData: FormData
): Promise<CoverUploadError> {
  if (formData.get("removeCover") === "on") {
    await removeEventCover(event);
    return null;
  }

  const file = formData.get("cover");
  if (file instanceof File && file.size > 0) {
    return saveEventCover(event, file);
  }

  return null;
}
