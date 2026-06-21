import { ru } from "@/lib/i18n/ru";
import { SMTP_SEND_ERROR_CODE } from "@/lib/smtp-send-error";
import { FOREIGN_EMAIL_ERROR_CODE } from "@/lib/allowed-email-domains";

const errorMessages: Record<string, string> = {
  Verification: ru.authErrorVerification,
  AccessDenied: ru.foreignEmailNotAllowed,
  Configuration: ru.authErrorConfiguration,
  Default: ru.authErrorDefault,
};

export function getAuthErrorMessage(
  error?: string | null,
  code?: string | null
): string {
  if (error === "CredentialsSignin") {
    if (code === SMTP_SEND_ERROR_CODE) {
      return ru.authErrorEmailSend;
    }
    if (code === FOREIGN_EMAIL_ERROR_CODE) {
      return ru.foreignEmailNotAllowed;
    }
    return ru.credentialsSigninError;
  }

  if (!error) return ru.authErrorDefault;

  const errorCode = error.split("/")[0];
  return errorMessages[errorCode] ?? ru.authErrorDefault;
}
