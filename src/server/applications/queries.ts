import { prisma } from "@/server/db/prisma";

export async function listApplicationsForUser(userId: string) {
  return prisma.application.findMany({
    where: { userId },
    include: {
      applicationTags: {
        include: {
          tag: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
