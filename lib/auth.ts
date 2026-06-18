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
import { SmtpSendError } from "@/lib/smtp-send-error";
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

        await connectDB();
        const user = await User.findOne({
          username: parsed.data.username.toLowerCase(),
        });

        if (!user?.passwordHash) {
          return null;
        }

        const valid = await verifyPassword(
          parsed.data.password,
          user.passwordHash
        );
        if (!valid) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name ?? null,
          email: user.email ?? null,
        };
      },
    }),
    Nodemailer({
      server: isConsoleEmail()
        ? { host: "localhost", port: 25, secure: false }
        : getSmtpServerConfig(),
      from: emailFromAddress(),
      async sendVerificationRequest({ identifier, url, provider }) {
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
