import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

function getAdapterConfig() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  return {
    connectionString: process.env.DATABASE_URL,
  };
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(getAdapterConfig()),
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
