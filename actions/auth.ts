"use server";

import { nanoid } from "nanoid";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import {
  isConsoleEmail,
  logMagicLinkToConsole,
  sendEmailVerificationEmail,
} from "@/lib/email";
import { isEnabled } from "@/lib/feature-flags";
import { hashPassword } from "@/lib/password";
import { getAppUrl } from "@/lib/magic-link";
import { ru } from "@/lib/i18n/ru";
import {
  linkEmailSchema,
  registerPasswordSchema,
  setPasswordSchema,
} from "@/lib/validations/auth";
import { isAllowedAuthEmail } from "@/lib/allowed-email-domains";
import { EmailVerificationToken } from "@/models/EmailVerificationToken";
import {
  User,
  userHasPassword,
  userHasVerifiedEmail,
} from "@/models/User";

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

export type AuthActionResult = {
  success: boolean;
  error?: string;
};

function validationError(message: string): AuthActionResult {
  return { success: false, error: message };
}

export async function registerWithPassword(
  formData: FormData
): Promise<AuthActionResult> {
  if (!(await isEnabled("passwordRegistration"))) {
    return validationError(ru.errorForbidden);
  }

  const parsed = registerPasswordSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return validationError(
      parsed.error.errors[0]?.message ?? ru.errorValidation
    );
  }

  await connectDB();

  const username = parsed.data.username.toLowerCase();
  const existingUsername = await User.findOne({ username }).lean();
  if (existingUsername) {
    return validationError(ru.usernameTaken);
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await User.create({
    username,
    passwordHash,
    name: parsed.data.name,
  });

  return { success: true };
}

export async function setUserPassword(
  formData: FormData
): Promise<AuthActionResult> {
  if (!(await isEnabled("passwordRegistration"))) {
    return validationError(ru.errorForbidden);
  }

  const session = await auth();
  if (!session?.user?.id) {
    return validationError(ru.errorUnauthorized);
  }

  const parsed = setPasswordSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return validationError(
      parsed.error.errors[0]?.message ?? ru.errorValidation
    );
  }

  await connectDB();

  const user = await User.findById(session.user.id);
  if (!user) {
    return validationError(ru.errorGeneric);
  }

  if (!userHasVerifiedEmail(user)) {
    return validationError(ru.linkEmailFirst);
  }

  if (userHasPassword(user)) {
    return validationError(ru.passwordAlreadySet);
  }

  const username = parsed.data.username.toLowerCase();
  if (
    user.name?.trim() &&
    username === user.name.trim().toLowerCase()
  ) {
    return validationError(ru.usernameMustDifferFromName);
  }

  const existingUsername = await User.findOne({
    username,
    _id: { $ne: user._id },
  }).lean();
  if (existingUsername) {
    return validationError(ru.usernameTaken);
  }

  user.username = username;
  user.passwordHash = await hashPassword(parsed.data.password);
  await user.save();

  return { success: true };
}

export async function requestEmailLink(
  formData: FormData
): Promise<AuthActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return validationError(ru.errorUnauthorized);
  }

  const parsed = linkEmailSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return validationError(
      parsed.error.errors[0]?.message ?? ru.errorValidation
    );
  }

  await connectDB();

  const user = await User.findById(session.user.id);
  if (!user) {
    return validationError(ru.errorGeneric);
  }

  if (userHasVerifiedEmail(user)) {
    return validationError(ru.emailAlreadyLinked);
  }

  const email = parsed.data.email;
  const existingEmail = await User.findOne({
    email,
    _id: { $ne: user._id },
  }).lean();
  if (existingEmail) {
    return validationError(ru.emailTaken);
  }

  const token = nanoid(32);
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);

  await EmailVerificationToken.deleteMany({ userId: user._id });
  await EmailVerificationToken.create({
    userId: user._id,
    email,
    token,
    expiresAt,
  });

  const verifyUrl = `${getAppUrl()}/profile/verify-email?token=${token}`;

  if (isConsoleEmail()) {
    logMagicLinkToConsole({
      to: email,
      url: verifyUrl,
      from: process.env["SMTP_FROM"] ?? "noreply@localhost",
    });
  } else {
    await sendEmailVerificationEmail({
      to: email,
      url: verifyUrl,
      from: process.env["SMTP_FROM"] ?? "noreply@localhost",
    });
  }

  return { success: true };
}

export async function verifyEmailToken(
  token: string
): Promise<AuthActionResult> {
  if (!token.trim()) {
    return validationError(ru.emailVerificationInvalid);
  }

  await connectDB();

  const record = await EmailVerificationToken.findOne({ token });
  if (!record || record.expiresAt < new Date()) {
    if (record) {
      await EmailVerificationToken.deleteOne({ _id: record._id });
    }
    return validationError(ru.emailVerificationInvalid);
  }

  if (!isAllowedAuthEmail(record.email)) {
    await EmailVerificationToken.deleteOne({ _id: record._id });
    return validationError(ru.foreignEmailNotAllowed);
  }

  const user = await User.findById(record.userId);
  if (!user) {
    await EmailVerificationToken.deleteOne({ _id: record._id });
    return validationError(ru.errorGeneric);
  }

  const existingEmail = await User.findOne({
    email: record.email,
    _id: { $ne: user._id },
  }).lean();
  if (existingEmail) {
    await EmailVerificationToken.deleteOne({ _id: record._id });
    return validationError(ru.emailTaken);
  }

  user.email = record.email;
  user.emailVerified = new Date();
  await user.save();
  await EmailVerificationToken.deleteOne({ _id: record._id });

  return { success: true };
}

export async function getPasswordAuthFlags(): Promise<{
  passwordLogin: boolean;
  passwordRegistration: boolean;
}> {
  const [passwordLogin, passwordRegistration] = await Promise.all([
    isEnabled("passwordLogin"),
    isEnabled("passwordRegistration"),
  ]);

  return { passwordLogin, passwordRegistration };
}
