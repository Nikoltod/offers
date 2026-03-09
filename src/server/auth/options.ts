import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { env } from "@/lib/validators/env";
import { signInSchema } from "@/lib/validators/auth";
import { comparePassword } from "@/server/auth/password";
import { enforceRateLimit } from "@/server/auth/rate-limit";
import { prisma } from "@/server/db/prisma";

const SIGN_IN_WINDOW_MS = 15 * 60 * 1000;
const SIGN_IN_MAX_ATTEMPTS = 10;
const DUMMY_HASH = "$2b$12$JcpOgxRxA0w3QmMfN8jjfOtZwY4dr5xwWQfQXU9Nf2/.vdlN4QOr2";

function isDemoCredential(email: string, password: string) {
  return env.ALLOW_DEMO_AUTH && email === env.DEMO_AUTH_EMAIL && password === env.DEMO_AUTH_PASSWORD;
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const rawEmail =
          typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
        const rawPassword = typeof credentials?.password === "string" ? credentials.password : "";

        if (isDemoCredential(rawEmail, rawPassword)) {
          return {
            id: "demo-admin",
            email: env.DEMO_AUTH_EMAIL,
            name: "admin",
            image: null,
          };
        }

        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) {
          await comparePassword("invalid-password", DUMMY_HASH);
          return null;
        }

        const rateLimit = await enforceRateLimit({
          action: "sign-in",
          identifier: parsed.data.email,
          maxAttempts: SIGN_IN_MAX_ATTEMPTS,
          windowMs: SIGN_IN_WINDOW_MS,
        });

        if (!rateLimit.allowed) {
          await comparePassword(parsed.data.password, DUMMY_HASH);
          return null;
        }

        let user = null;

        try {
          user = await prisma.user.findUnique({
            where: { email: parsed.data.email },
          });
        } catch {
          await comparePassword(parsed.data.password, DUMMY_HASH);
          return null;
        }

        if (!user) {
          await comparePassword(parsed.data.password, DUMMY_HASH);
          return null;
        }

        const isPasswordValid = await comparePassword(parsed.data.password, user.passwordHash);
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && typeof token.id === "string") {
        session.user.id = token.id;
      }
      return session;
    },
  },
  secret: env.AUTH_SECRET,
};
