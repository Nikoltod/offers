import { hash } from "bcryptjs";

import { prisma } from "@/server/db/prisma";

const BOOTSTRAP_ADMIN_EMAIL = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
const BOOTSTRAP_ADMIN_PASSWORD = process.env.BOOTSTRAP_ADMIN_PASSWORD;

function assertBootstrapEnv() {
  if (!BOOTSTRAP_ADMIN_EMAIL || !BOOTSTRAP_ADMIN_PASSWORD) {
    throw new Error(
      "BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD are required for bootstrap-admin",
    );
  }
}

async function main() {
  assertBootstrapEnv();

  const existingUser = await prisma.user.findUnique({
    where: { email: BOOTSTRAP_ADMIN_EMAIL },
    select: { id: true, email: true },
  });

  if (existingUser) {
    console.log(`✓ Admin user already exists: ${existingUser.email}`);
    return;
  }

  const passwordHash = await hash(BOOTSTRAP_ADMIN_PASSWORD, 12);

  const user = await prisma.user.create({
    data: {
      email: BOOTSTRAP_ADMIN_EMAIL,
      name: "Admin",
      passwordHash,
    },
    select: { id: true, email: true },
  });

  console.log(`✓ Created admin user: ${user.email}`);
}

main()
  .catch((error) => {
    console.error("❌ bootstrap-admin failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
