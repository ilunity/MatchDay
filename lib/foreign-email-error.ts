import { CredentialsSignin } from "next-auth";
import { FOREIGN_EMAIL_ERROR_CODE } from "@/lib/allowed-email-domains";

export class ForeignEmailError extends CredentialsSignin {
  code = FOREIGN_EMAIL_ERROR_CODE;
}
