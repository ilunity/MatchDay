import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import Nodemailer from "next-auth/providers/nodemailer";
import { authConfig } from "@/lib/auth.config";
import { connectDB } from "@/lib/db";
import {
  getSmtpConfigSnapshot,
  getSmtpServerConfig,
  isConsoleEmail,
  isSmtpHtmlEnabled,
  logMagicLinkToConsole,
  logSmtpEvent,
  sendMagicLinkEmail,
} from "@/lib/email";
import { isEnabled } from "@/lib/feature-flags";
import { buildMagicLinkVerifyUrl, getAppUrl } from "@/lib/magic-link";
import clientPromise from "@/lib/mongodb-client";
import { verifyPassword } from "@/lib/password";
import {
  checkAccountLock,
  checkIpLock,
  clearLoginFailures,
  getClientIp,
  recordAccountFailure,
  recordIpFailure,
} from "@/lib/login-lockout";
import {
  AccountLoginLockedError,
  IpLoginLockedError,
} from "@/lib/login-lockout-errors";
import { SmtpSendError } from "@/lib/smtp-send-error";
import { ForeignEmailError } from "@/lib/foreign-email-error";
import { isAllowedAuthEmail } from "@/lib/allowed-email-domains";
import { credentialsLoginSchema } from "@/lib/validations/auth";
import { User } from "@/models/User";

function emailFromAddress(): string {
  return process.env["SMTP_FROM"] ?? "noreply@localhost";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      const nextToken = await authConfig.callbacks.jwt({
        token,
        user,
        trigger,
        session,
      });

      const userId = user?.id ?? (typeof token.sub === "string" ? token.sub : null);
      if (userId) {
        await connectDB();
        const dbUser = await User.findById(userId)
          .select("avatarKey name email username")
          .lean<{
            avatarKey?: string;
            name?: string;
            email?: string;
            username?: string;
          }>();
        if (dbUser) {
          nextToken.avatarKey = dbUser.avatarKey ?? null;
          if (dbUser.name) {
            nextToken.name = dbUser.name;
          }
          nextToken.email = dbUser.email ?? null;
          nextToken.username = dbUser.username ?? null;
        }
      }

      return nextToken;
    },
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!(await isEnabled("passwordLogin"))) {
          return null;
        }

        const parsed = credentialsLoginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const username = parsed.data.username.toLowerCase();
        const ip = await getClientIp();

        const ipLock = await checkIpLock(ip);
        if (ipLock.locked && ipLock.lockedUntil) {
          throw new IpLoginLockedError(ipLock.lockedUntil);
        }

        await connectDB();
        const user = await User.findOne({ username });

        if (user?.passwordHash) {
          const accountLock = await checkAccountLock(username);
          if (accountLock.locked && accountLock.lockedUntil) {
            throw new AccountLoginLockedError(accountLock.lockedUntil);
          }
        }

        const passwordHash = user?.passwordHash;
        const valid =
          !!passwordHash &&
          (await verifyPassword(parsed.data.password, passwordHash));

        if (valid && user) {
          await clearLoginFailures(ip, username);
          return {
            id: user._id.toString(),
            name: user.name ?? null,
            email: user.email ?? null,
          };
        }

        const ipFailure = await recordIpFailure(ip);
        if (ipFailure.locked && ipFailure.lockedUntil) {
          throw new IpLoginLockedError(ipFailure.lockedUntil);
        }

        if (user?.passwordHash) {
          const accountFailure = await recordAccountFailure(username);
          if (accountFailure.locked && accountFailure.lockedUntil) {
            throw new AccountLoginLockedError(accountFailure.lockedUntil);
          }
        }

        return null;
      },
    }),
    Nodemailer({
      server: isConsoleEmail()
        ? { host: "localhost", port: 25, secure: false }
        : getSmtpServerConfig(),
      from: emailFromAddress(),
      async sendVerificationRequest({ identifier, url, provider }) {
        if (!isAllowedAuthEmail(identifier)) {
          throw new ForeignEmailError();
        }

        const from = provider.from ?? emailFromAddress();
        const verifyUrl = buildMagicLinkVerifyUrl(url);
        const mode = isConsoleEmail() ? "console" : "smtp";
        const html = await isSmtpHtmlEnabled();

        await logSmtpEvent("info", "verification.request", {
          to: identifier,
          from,
          mode,
          html,
          appUrl: getAppUrl(),
          config: await getSmtpConfigSnapshot(),
        });

        if (isConsoleEmail()) {
          logMagicLinkToConsole({ to: identifier, url: verifyUrl, from });
          await logSmtpEvent("info", "verification.console", { to: identifier });
          return;
        }

        try {
          await sendMagicLinkEmail({
            to: identifier,
            url: verifyUrl,
            from,
          });
          await logSmtpEvent("info", "verification.complete", {
            to: identifier,
            mode,
            html,
          });
        } catch (error) {
          await logSmtpEvent("error", "verification.failed", {
            to: identifier,
            from,
            mode,
            message: error instanceof Error ? error.message : String(error),
          });
          throw new SmtpSendError();
        }
      },
    }),
  ],
});
