import { hash } from "bcryptjs";

import { prisma } from "@/server/db/prisma";

function getBootstrapEnv() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD are required for bootstrap-admin",
    );
  }

  return { email, password };
}

async function main() {
  const { email, password } = getBootstrapEnv();

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });

  if (existingUser) {
    console.log(`✓ Admin user already exists: ${existingUser.email}`);
    return;
  }

  const passwordHash = await hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
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
