import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import Nodemailer from "next-auth/providers/nodemailer";
import { authConfig } from "@/lib/auth.config";
import { connectDB } from "@/lib/db";
import {
  getSmtpServerConfig,
  isConsoleEmail,
  logMagicLinkToConsole,
  sendMagicLinkEmail,
} from "@/lib/email";
import clientPromise from "@/lib/mongodb-client";
import { User } from "@/models/User";

const consoleEmail = isConsoleEmail();
const emailFrom = process.env.SMTP_FROM ?? "noreply@localhost";

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
      server: consoleEmail
        ? { host: "localhost", port: 25, secure: false }
        : getSmtpServerConfig(),
      from: emailFrom,
      sendVerificationRequest({ identifier, url, provider }) {
        const from = provider.from ?? emailFrom;

        if (consoleEmail) {
          logMagicLinkToConsole({ to: identifier, url, from });
          return;
        }

        return sendMagicLinkEmail({ to: identifier, url, from });
      },
    }),
  ],
});
