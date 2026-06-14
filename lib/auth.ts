import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import Nodemailer from "next-auth/providers/nodemailer";
import { authConfig } from "@/lib/auth.config";
import { isConsoleEmail, logMagicLinkToConsole } from "@/lib/email";
import clientPromise from "@/lib/mongodb-client";

const consoleEmail = isConsoleEmail();
const emailFrom = process.env.SMTP_FROM ?? "noreply@localhost";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Nodemailer({
      server: consoleEmail
        ? { host: "localhost", port: 25, secure: false }
        : {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT ?? 587),
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASSWORD,
            },
          },
      from: emailFrom,
      ...(consoleEmail && {
        sendVerificationRequest({ identifier, url, provider }) {
          logMagicLinkToConsole({
            to: identifier,
            url,
            from: provider.from ?? emailFrom,
          });
        },
      }),
    }),
  ],
});
