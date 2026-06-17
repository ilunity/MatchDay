import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import Nodemailer from "next-auth/providers/nodemailer";
import { authConfig } from "@/lib/auth.config";
import { connectDB } from "@/lib/db";
import {
  getSmtpConfigSnapshot,
  getSmtpServerConfig,
  isConsoleEmail,
  logMagicLinkToConsole,
  logSmtpEvent,
  sendMagicLinkEmail,
} from "@/lib/email";
import { buildMagicLinkVerifyUrl, getAppUrl } from "@/lib/magic-link";
import clientPromise from "@/lib/mongodb-client";
import { SmtpSendError } from "@/lib/smtp-send-error";
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

      if (user?.id) {
        await connectDB();
        const dbUser = await User.findById(user.id)
          .select("avatarKey name")
          .lean<{ avatarKey?: string; name?: string }>();
        if (dbUser) {
          nextToken.avatarKey = dbUser.avatarKey ?? null;
          if (dbUser.name) {
            nextToken.name = dbUser.name;
          }
        }
      }

      return nextToken;
    },
  },
  providers: [
    Nodemailer({
      server: isConsoleEmail()
        ? { host: "localhost", port: 25, secure: false }
        : getSmtpServerConfig(),
      from: emailFromAddress(),
      async sendVerificationRequest({ identifier, url, provider }) {
        const from = provider.from ?? emailFromAddress();
        const verifyUrl = buildMagicLinkVerifyUrl(url);
        const mode = isConsoleEmail() ? "console" : "smtp";

        logSmtpEvent("info", "verification.request", {
          to: identifier,
          from,
          mode,
          appUrl: getAppUrl(),
          config: getSmtpConfigSnapshot(),
        });

        if (isConsoleEmail()) {
          logMagicLinkToConsole({ to: identifier, url: verifyUrl, from });
          logSmtpEvent("info", "verification.console", { to: identifier });
          return;
        }

        try {
          await sendMagicLinkEmail({ to: identifier, url: verifyUrl, from });
          logSmtpEvent("info", "verification.complete", { to: identifier, mode });
        } catch (error) {
          logSmtpEvent("error", "verification.failed", {
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
