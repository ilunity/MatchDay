import { ru } from "@/lib/i18n/ru";
import { SMTP_SEND_ERROR_CODE } from "@/lib/smtp-send-error";

const errorMessages: Record<string, string> = {
  Verification: ru.authErrorVerification,
  AccessDenied: ru.authErrorAccessDenied,
  Configuration: ru.authErrorConfiguration,
  Default: ru.authErrorDefault,
};

export function getAuthErrorMessage(
  error?: string | null,
  code?: string | null
): string {
  if (error === "CredentialsSignin" && code === SMTP_SEND_ERROR_CODE) {
    return ru.authErrorEmailSend;
  }

  if (!error) return ru.authErrorDefault;

  const errorCode = error.split("/")[0];
  return errorMessages[errorCode] ?? ru.authErrorDefault;
}
