import { ru } from "@/lib/i18n/ru";

const errorMessages: Record<string, string> = {
  Verification: ru.authErrorVerification,
  AccessDenied: ru.authErrorAccessDenied,
  Configuration: ru.authErrorConfiguration,
  Default: ru.authErrorDefault,
};

export function getAuthErrorMessage(error?: string | null): string {
  if (!error) return ru.authErrorDefault;

  const code = error.split("/")[0];
  return errorMessages[code] ?? ru.authErrorDefault;
}
