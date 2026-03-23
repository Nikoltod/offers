import { ApplicationStatus } from "@prisma/client";

export type DemoJobPosting = {
  slug: string;
  company: string;
  role: string;
  location: string;
  salaryRange?: string;
  jobUrl: string;
  status: ApplicationStatus;
  appliedDate: string;
  nextActionDate?: string;
  summary: string;
  tags: string[];
};

const demoJobPostings: DemoJobPosting[] = [
  {
    slug: "northstar-labs-platform-engineer",
    company: "Northstar Labs",
    role: "Platform Engineer",
    location: "Remote - EU",
    salaryRange: "$95,000 - $120,000",
    jobUrl: "https://northstar-labs.example/jobs/platform-engineer",
    status: ApplicationStatus.WISHLIST,
    appliedDate: "2026-03-01",
    nextActionDate: "2026-03-18",
    summary:
      "Infrastructure-focused platform role with Kubernetes, observability, and developer experience ownership.",
    tags: ["platform", "kubernetes", "remote"],
  },
  {
    slug: "fjord-analytics-data-platform-engineer",
    company: "Fjord Analytics",
    role: "Data Platform Engineer",
    location: "Berlin, Germany",
    salaryRange: "$88,000 - $110,000",
    jobUrl: "https://fjord-analytics.example/careers/data-platform-engineer",
    status: ApplicationStatus.APPLIED,
    appliedDate: "2026-02-24",
    nextActionDate: "2026-03-19",
    summary:
      "ETL pipelines, warehouse modeling, and Python services supporting analytics teams.",
    tags: ["data", "python", "etl"],
  },
  {
    slug: "latticeforge-frontend-engineer",
    company: "LatticeForge",
    role: "Frontend Engineer",
    location: "Sofia, Bulgaria",
    salaryRange: "$70,000 - $90,000",
    jobUrl: "https://latticeforge.example/jobs/frontend-engineer",
    status: ApplicationStatus.TECHNICAL,
    appliedDate: "2026-02-20",
    nextActionDate: "2026-03-21",
    summary:
      "React-heavy product team building internal dashboards, design systems, and polished admin tooling.",
    tags: ["frontend", "react", "design-system"],
  },
  {
    slug: "copper-harbor-ai-product-engineer",
    company: "Copper Harbor AI",
    role: "Product Engineer",
    location: "Remote - US",
    salaryRange: "$115,000 - $145,000",
    jobUrl: "https://copperharbor-ai.example/openings/product-engineer",
    status: ApplicationStatus.HR,
    appliedDate: "2026-02-18",
    nextActionDate: "2026-03-17",
    summary:
      "Full-stack product engineering for internal AI tools with strong ownership over shipping customer value.",
    tags: ["product", "full-stack", "ai"],
  },
  {
    slug: "beacon-ledger-backend-engineer",
    company: "Beacon Ledger",
    role: "Backend Engineer",
    location: "London, UK",
    salaryRange: "$100,000 - $130,000",
    jobUrl: "https://beacon-ledger.example/careers/backend-engineer",
    status: ApplicationStatus.OFFER,
    appliedDate: "2026-02-10",
    nextActionDate: "2026-03-22",
    summary:
      "Event-driven backend systems, APIs, and financial data pipelines with reliability requirements.",
    tags: ["backend", "apis", "finance"],
  },
  {
    slug: "summit-ridge-cloud-site-reliability-engineer",
    company: "Summit Ridge Cloud",
    role: "Site Reliability Engineer",
    location: "Amsterdam, Netherlands",
    salaryRange: "$105,000 - $135,000",
    jobUrl: "https://summitridge-cloud.example/jobs/sre",
    status: ApplicationStatus.WISHLIST,
    appliedDate: "2026-03-03",
    nextActionDate: "2026-03-24",
    summary:
      "SRE role focused on incident response, performance engineering, and cloud cost controls.",
    tags: ["sre", "cloud", "observability"],
  },
  {
    slug: "harbor-grid-full-stack-engineer",
    company: "Harbor Grid",
    role: "Full-Stack Engineer",
    location: "Remote - Europe",
    salaryRange: "$82,000 - $102,000",
    jobUrl: "https://harbor-grid.example/careers/full-stack-engineer",
    status: ApplicationStatus.APPLIED,
    appliedDate: "2026-03-05",
    nextActionDate: "2026-03-25",
    summary:
      "Product development across TypeScript services and React interfaces in the climate-tech space.",
    tags: ["typescript", "react", "node"],
  },
  {
    slug: "arcwell-health-senior-data-engineer",
    company: "Arcwell Health",
    role: "Senior Data Engineer",
    location: "Munich, Germany",
    salaryRange: "$98,000 - $122,000",
    jobUrl: "https://arcwell-health.example/jobs/senior-data-engineer",
    status: ApplicationStatus.WISHLIST,
    appliedDate: "2026-03-07",
    nextActionDate: "2026-03-28",
    summary:
      "Healthcare analytics platform role centered on batch processing, streaming, and governance.",
    tags: ["data-engineering", "healthcare", "streaming"],
  },
  {
    slug: "foundry-works-staff-frontend-engineer",
    company: "Foundry Works",
    role: "Staff Frontend Engineer",
    location: "Remote - UK",
    salaryRange: "$118,000 - $148,000",
    jobUrl: "https://foundry-works.example/open-roles/staff-frontend",
    status: ApplicationStatus.WISHLIST,
    appliedDate: "2026-03-08",
    nextActionDate: "2026-03-29",
    summary:
      "Senior frontend leadership role driving architecture, accessibility, and performance for complex workflows.",
    tags: ["frontend", "accessibility", "performance"],
  },
  {
    slug: "blue-cascade-security-backend-engineer",
    company: "Blue Cascade Security",
    role: "Backend Engineer",
    location: "Prague, Czech Republic",
    salaryRange: "$92,000 - $118,000",
    jobUrl: "https://blue-cascade.example/careers/backend-engineer",
    status: ApplicationStatus.WISHLIST,
    appliedDate: "2026-03-10",
    nextActionDate: "2026-03-30",
    summary:
      "Security product backend role around audit trails, policy engines, and multi-tenant APIs.",
    tags: ["backend", "security", "multi-tenant"],
  },
  {
    slug: "cedar-point-labs-developer-tools-engineer",
    company: "Cedar Point Labs",
    role: "Developer Tools Engineer",
    location: "Remote - Global",
    salaryRange: "$108,000 - $138,000",
    jobUrl: "https://cedarpoint-labs.example/jobs/developer-tools-engineer",
    status: ApplicationStatus.WISHLIST,
    appliedDate: "2026-03-11",
    nextActionDate: "2026-04-01",
    summary:
      "Build internal tooling and CI/CD systems that improve release velocity and developer feedback loops.",
    tags: ["developer-tools", "ci-cd", "platform"],
  },
  {
    slug: "meridian-ops-software-engineer",
    company: "Meridian Ops",
    role: "Software Engineer",
    location: "Warsaw, Poland",
    salaryRange: "$76,000 - $96,000",
    jobUrl: "https://meridian-ops.example/jobs/software-engineer",
    status: ApplicationStatus.WISHLIST,
    appliedDate: "2026-03-12",
    nextActionDate: "2026-04-02",
    summary:
      "Generalist engineering role across operations software, workflow automation, and reporting tools.",
    tags: ["generalist", "automation", "operations"],
  },
];

export function listDemoJobPostings() {
  return demoJobPostings;
}

export function getDemoJobPostingBySlug(slug: string) {
  return demoJobPostings.find((posting) => posting.slug === slug) ?? null;
}