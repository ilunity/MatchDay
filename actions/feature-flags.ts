"use server";

import { isAdminEmail } from "@/lib/admin";
import { auth } from "@/lib/auth";
import {
  FEATURE_FLAGS,
  type FeatureFlagKey,
} from "@/lib/feature-flags.registry";
import { setFeatureFlagEnabled } from "@/lib/feature-flags";
import { ru } from "@/lib/i18n/ru";
import { revalidatePath } from "next/cache";

export type FeatureFlagActionResult = {
  success: boolean;
  error?: string;
};

export async function updateFeatureFlag(
  key: FeatureFlagKey,
  enabled: boolean
): Promise<FeatureFlagActionResult> {
  const session = await auth();
  const email = session?.user?.email;

  if (!session?.user?.id) {
    return { success: false, error: ru.errorUnauthorized };
  }

  if (!isAdminEmail(email)) {
    return { success: false, error: ru.errorForbidden };
  }

  if (!(key in FEATURE_FLAGS)) {
    return { success: false, error: ru.errorValidation };
  }

  await setFeatureFlagEnabled(key, enabled, email ?? undefined);
  revalidatePath("/admin/flags");

  return { success: true };
}
