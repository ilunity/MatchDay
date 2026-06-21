import { ru } from "@/lib/i18n/ru";
import { SMTP_SEND_ERROR_CODE } from "@/lib/smtp-send-error";
import { FOREIGN_EMAIL_ERROR_CODE } from "@/lib/allowed-email-domains";
import {
  parseLoginLockoutCode,
  type ParsedLoginLockout,
} from "@/lib/login-lockout-errors";

const errorMessages: Record<string, string> = {
  Verification: ru.authErrorVerification,
  AccessDenied: ru.foreignEmailNotAllowed,
  Configuration: ru.authErrorConfiguration,
  Default: ru.authErrorDefault,
};

export function getLoginLockoutMessage(
  lockout: ParsedLoginLockout,
  secondsRemaining?: number
): string {
  if (secondsRemaining !== undefined && secondsRemaining > 0) {
    return lockout.type === "ip"
      ? `${ru.loginIpLockedPrefix} ${ru.loginLockedCountdown(secondsRemaining)}`
      : `${ru.loginAccountLockedPrefix} ${ru.loginLockedCountdown(secondsRemaining)}`;
  }

  const minutes = Math.max(
    1,
    Math.ceil((lockout.lockedUntil.getTime() - Date.now()) / 60_000)
  );

  return lockout.type === "ip"
    ? ru.loginIpLocked(minutes)
    : ru.loginAccountLocked(minutes);
}

export function getAuthErrorMessage(
  error?: string | null,
  code?: string | null
): string {
  if (error === "CredentialsSignin") {
    const lockout = parseLoginLockoutCode(code);
    if (lockout) {
      return getLoginLockoutMessage(lockout);
    }

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
