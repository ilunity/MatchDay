import type { NextAuthConfig } from "next-auth";
import { isAllowedAuthEmail } from "@/lib/allowed-email-domains";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/error",
  },
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "nodemailer") {
        if (!user.email || !isAllowedAuthEmail(user.email)) {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      if (trigger === "update" && session) {
        if (session.name !== undefined) {
          token.name = session.name;
        }
        if ("avatarKey" in session) {
          token.avatarKey = session.avatarKey ?? null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.name =
          typeof token.name === "string" ? token.name : session.user.name;
        session.user.email =
          typeof token.email === "string" ? token.email : session.user.email;
        session.user.username =
          typeof token.username === "string" ? token.username : null;
        session.user.avatarKey =
          typeof token.avatarKey === "string" ? token.avatarKey : null;
      }
      return session;
    },
  },
  providers: [],
  trustHost: true,
} satisfies NextAuthConfig;
