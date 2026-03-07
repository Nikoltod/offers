import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { signInSchema } from "@/lib/validators/auth";
import { comparePassword } from "@/server/auth/password";
import { enforceRateLimit } from "@/server/auth/rate-limit";
import { prisma } from "@/server/db/prisma";

const SIGN_IN_WINDOW_MS = 15 * 60 * 1000;
const SIGN_IN_MAX_ATTEMPTS = 10;
const DUMMY_HASH = "$2b$12$JcpOgxRxA0w3QmMfN8jjfOtZwY4dr5xwWQfQXU9Nf2/.vdlN4QOr2";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
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

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });

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
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
};
