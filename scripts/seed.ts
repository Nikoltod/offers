import { ApplicationStatus } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { hash } from "bcryptjs";

const DEMO_USER_EMAIL = "admin@local.dev";
const DEMO_USER_PASSWORD = "123";

const demoPostings = [
  {
    company: "Northstar Labs",
    role: "Platform Engineer",
    location: "Remote - EU",
    salaryRange: "$95,000 - $120,000",
    jobUrl: "https://northstar-labs.example/jobs/platform-engineer",
    status: ApplicationStatus.WISHLIST,
    appliedDate: new Date("2026-03-01"),
    nextActionDate: new Date("2026-03-18"),
    notes: "Demo posting for infrastructure-focused role with Kubernetes and observability work.",
    tags: ["platform", "kubernetes", "remote"],
  },
  {
    company: "Fjord Analytics",
    role: "Data Platform Engineer",
    location: "Berlin, Germany",
    salaryRange: "$88,000 - $110,000",
    jobUrl: "https://fjord-analytics.example/careers/data-platform-engineer",
    status: ApplicationStatus.APPLIED,
    appliedDate: new Date("2026-02-24"),
    nextActionDate: new Date("2026-03-19"),
    notes: "Demo posting focused on ETL pipelines, warehouse modeling, and Python services.",
    tags: ["data", "python", "etl"],
  },
  {
    company: "LatticeForge",
    role: "Frontend Engineer",
    location: "Sofia, Bulgaria",
    salaryRange: "$70,000 - $90,000",
    jobUrl: "https://latticeforge.example/jobs/frontend-engineer",
    status: ApplicationStatus.TECHNICAL,
    appliedDate: new Date("2026-02-20"),
    nextActionDate: new Date("2026-03-21"),
    notes: "Demo posting with React, design systems, and dashboard-heavy UI work.",
    tags: ["frontend", "react", "design-system"],
  },
  {
    company: "Copper Harbor AI",
    role: "Product Engineer",
    location: "Remote - US",
    salaryRange: "$115,000 - $145,000",
    jobUrl: "https://copperharbor-ai.example/openings/product-engineer",
    status: ApplicationStatus.HR,
    appliedDate: new Date("2026-02-18"),
    nextActionDate: new Date("2026-03-17"),
    notes: "Demo posting for shipping internal AI tools with strong product ownership.",
    tags: ["product", "full-stack", "ai"],
  },
  {
    company: "Beacon Ledger",
    role: "Backend Engineer",
    location: "London, UK",
    salaryRange: "$100,000 - $130,000",
    jobUrl: "https://beacon-ledger.example/careers/backend-engineer",
    status: ApplicationStatus.OFFER,
    appliedDate: new Date("2026-02-10"),
    nextActionDate: new Date("2026-03-22"),
    notes: "Demo posting around event-driven systems, APIs, and financial data processing.",
    tags: ["backend", "apis", "finance"],
  },
] as const;

async function main() {
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

  let createdCount = 0;
  for (const posting of demoPostings) {
    const { tags, ...applicationData } = posting;

    const app = await prisma.application.create({
      data: {
        ...applicationData,
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
