import { prisma } from "@/server/db/prisma";
import { hash } from "bcryptjs";

const DEMO_USER_EMAIL = "admin@local.dev";
const DEMO_USER_PASSWORD = "123";

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
        password: hashedPassword,
      },
    });
    console.log("✓ Created demo user:", DEMO_USER_EMAIL);
  }

  // Get user ID for seeding applications
  const user = await prisma.user.findUniqueOrThrow({
    where: { email: DEMO_USER_EMAIL },
  });

  // Clear existing applications (optional - comment out to keep)
  // await prisma.tag.deleteMany({ where: { userId: user.id } });
  // await prisma.application.deleteMany({ where: { userId: user.id } });

  // Seed sample applications
  const sampleApps = [
    {
      company: "Acme Corp",
      role: "Senior Software Engineer",
      location: "San Francisco, CA",
      salaryMin: 150000,
      salaryMax: 180000,
      jobUrl: "https://acme.corp/jobs/123",
      status: "applied" as const,
      appliedDate: new Date("2024-01-15"),
      nextActionDate: new Date("2024-01-22"),
      notes: "Great company culture, competitive salary",
      tags: ["remote", "react"],
    },
    {
      company: "TechStart Inc",
      role: "Full Stack Developer",
      location: "New York, NY",
      salaryMin: 120000,
      salaryMax: 140000,
      jobUrl: "https://techstart.io/careers",
      status: "interview" as const,
      appliedDate: new Date("2024-01-10"),
      nextActionDate: new Date("2024-01-20"),
      notes: "Second round interview scheduled",
      tags: ["hybrid", "typescript", "nextjs"],
    },
    {
      company: "CloudScale",
      role: "Backend Engineer",
      location: "Austin, TX",
      salaryMin: 130000,
      salaryMax: 160000,
      jobUrl: "https://cloudscale.io/jobs/456",
      status: "rejected" as const,
      appliedDate: new Date("2024-01-05"),
      nextActionDate: null,
      notes: "Rejected after coding challenge",
      tags: ["python", "golang"],
    },
    {
      company: "DataFlow Systems",
      role: "Data Engineer",
      location: "Seattle, WA",
      salaryMin: 140000,
      salaryMax: 170000,
      jobUrl: "https://dataflow.org/careers",
      status: "offer" as const,
      appliedDate: new Date("2023-12-20"),
      nextActionDate: new Date("2024-01-25"),
      notes: "Offer received, evaluating benefits package",
      tags: ["python", "spark", "remote"],
    },
    {
      company: "MobileFirst Labs",
      role: "React Native Developer",
      location: "Chicago, IL",
      salaryMin: 110000,
      salaryMax: 135000,
      jobUrl: "https://mobilefirst.ai/jobs",
      status: "applied" as const,
      appliedDate: new Date("2024-01-18"),
      nextActionDate: new Date("2024-02-01"),
      notes: "Focus on mobile-first products",
      tags: ["react-native", "javascript"],
    },
    {
      company: "FinServe Technologies",
      role: "Rust Engineer",
      location: "Boston, MA",
      salaryMin: 160000,
      salaryMax: 190000,
      jobUrl: "https://finserve.com/careers/rust",
      status: "interview" as const,
      appliedDate: new Date("2024-01-08"),
      nextActionDate: new Date("2024-01-28"),
      notes: "First round completed, awaiting final round invite",
      tags: ["rust", "finance", "low-latency"],
    },
    {
      company: "OpenAI",
      role: "Infrastructure Engineer",
      location: "San Francisco, CA",
      salaryMin: 180000,
      salaryMax: 220000,
      jobUrl: "https://openai.com/careers",
      status: "applied" as const,
      appliedDate: new Date("2024-01-12"),
      nextActionDate: new Date("2024-02-05"),
      notes: "Applied through referral, researching team",
      tags: ["distributed-systems", "scale"],
    },
    {
      company: "GreenEnergy Co",
      role: "DevOps Engineer",
      location: "Denver, CO",
      salaryMin: 125000,
      salaryMax: 155000,
      jobUrl: "https://greenenergy.io/jobs",
      status: "applied" as const,
      appliedDate: new Date("2024-01-16"),
      nextActionDate: new Date("2024-01-30"),
      notes: "Strong mission alignment, sustainable tech focus",
      tags: ["kubernetes", "aws", "terraform"],
    },
  ];

  let createdCount = 0;
  for (const appData of sampleApps) {
    const { tags, ...appFields } = appData;
    const app = await prisma.application.create({
      data: {
        ...appFields,
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

  console.log(`✓ Created ${createdCount} sample applications`);
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
