import { CredentialsSignin } from "next-auth";

export const SMTP_SEND_ERROR_CODE = "smtp_send_failed";

/** Client-safe auth error when magic link email fails to send via SMTP. */
export class SmtpSendError extends CredentialsSignin {
  code = SMTP_SEND_ERROR_CODE;
}
