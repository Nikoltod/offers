import { Prisma } from "@prisma/client";

import { DASHBOARD_SORT_CONFIG } from "@/lib/constants/dashboard-sort";
import { DashboardFilters } from "@/lib/validators/dashboard-filters";
import { prisma } from "@/server/db/prisma";

type ApplicationQueryFilters = DashboardFilters;

function mapSortToOrderBy(sort: ApplicationQueryFilters["sort"]) {
  return DASHBOARD_SORT_CONFIG[sort].orderBy as Prisma.ApplicationOrderByWithRelationInput;
}

export async function listApplicationsForUser(userId: string, filters: ApplicationQueryFilters) {
  const where: Prisma.ApplicationWhereInput = {
    userId,
    ...(filters.q
      ? {
          OR: [
            {
              company: {
                contains: filters.q,
                mode: "insensitive",
              },
            },
            {
              role: {
                contains: filters.q,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
    ...(filters.status !== "ALL" ? { status: filters.status } : {}),
    ...(filters.tag
      ? {
          applicationTags: {
            some: {
              tag: {
                name: filters.tag,
              },
            },
          },
        }
      : {}),
  };

  try {
    return await prisma.application.findMany({
      where,
      include: {
        applicationTags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: mapSortToOrderBy(filters.sort),
    });
  } catch {
    return [];
  }
}

export async function listTagsForUser(userId: string) {
  try {
    return await prisma.tag.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
  } catch {
    return [];
  }
}
