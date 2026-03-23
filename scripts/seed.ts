import { hash } from "bcryptjs";

import { listDemoJobPostings } from "@/server/job-postings/catalog";
import { prisma } from "@/server/db/prisma";

const DEMO_USER_EMAIL = "admin@local.dev";
const DEMO_USER_PASSWORD = "password123";

function isProdSeedAllowed() {
  return process.env.ALLOW_PROD_SEED === "true";
}

async function main() {
  if (process.env.NODE_ENV === "production" && !isProdSeedAllowed()) {
    throw new Error("Refusing to run demo seed in production. Set ALLOW_PROD_SEED=true to override.");
  }

  console.log("🌱 Starting seed...");

  // Create demo user if not exists
  const existingUser = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
  });

  if (existingUser) {
    console.log("✓ Demo user already exists");
  } else {
    const hashedPassword = await hash(DEMO_USER_PASSWORD, 12);
    await prisma.user.create({
      data: {
        email: DEMO_USER_EMAIL,
        name: "Demo Admin",
        passwordHash: hashedPassword,
      },
    });
    console.log("✓ Created demo user:", DEMO_USER_EMAIL);
  }

  // Get user ID for seeding applications
  const user = await prisma.user.findUniqueOrThrow({
    where: { email: DEMO_USER_EMAIL },
  });

  await prisma.application.deleteMany({
    where: { userId: user.id },
  });

  await prisma.tag.deleteMany({
    where: { userId: user.id },
  });

  const demoPostings = listDemoJobPostings().slice(0, 5);

  let createdCount = 0;
  for (const posting of demoPostings) {
    const {
      company,
      role,
      location,
      salaryRange,
      jobUrl,
      status,
      summary,
      tags,
      appliedDate,
      nextActionDate,
    } = posting;

    const app = await prisma.application.create({
      data: {
        company,
        role,
        location,
        salaryRange,
        jobUrl,
        status,
        notes: summary,
        appliedDate: new Date(appliedDate),
        nextActionDate: nextActionDate ? new Date(nextActionDate) : undefined,
        userId: user.id,
      },
    });

    // Create associated tags
    for (const tagName of tags) {
      const tag = await prisma.tag.upsert({
        where: { userId_name: { userId: user.id, name: tagName } },
        update: {},
        create: { userId: user.id, name: tagName },
      });

      await prisma.applicationTag.create({
        data: { applicationId: app.id, tagId: tag.id },
      });
    }

    createdCount++;
  }

  console.log(`✓ Created ${createdCount} demo postings as applications`);
  console.log("✅ Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
