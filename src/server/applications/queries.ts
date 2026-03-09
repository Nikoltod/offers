import { Prisma } from "@prisma/client";

import { DASHBOARD_SORT_CONFIG } from "@/lib/constants/dashboard-sort";
import { DashboardFilters } from "@/lib/validators/dashboard-filters";
import { prisma } from "@/server/db/prisma";

type ApplicationQueryFilters = DashboardFilters;
type QueryResult<TData> = {
  data: TData;
  degraded: boolean;
};

type ApplicationWithTags = Prisma.ApplicationGetPayload<{
  include: {
    applicationTags: {
      include: {
        tag: true;
      };
    };
  };
}>;

type UserTag = {
  id: string;
  name: string;
};

function mapSortToOrderBy(sort: ApplicationQueryFilters["sort"]) {
  return DASHBOARD_SORT_CONFIG[sort].orderBy as Prisma.ApplicationOrderByWithRelationInput;
}

export async function listApplicationsForUser(
  userId: string,
  filters: ApplicationQueryFilters,
): Promise<QueryResult<ApplicationWithTags[]>> {
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
    const data = await prisma.application.findMany({
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

    return {
      data,
      degraded: false,
    };
  } catch (error) {
    console.error("Failed to list applications for dashboard", {
      userId,
      filters,
      error,
    });

    return {
      data: [],
      degraded: true,
    };
  }
}

export async function listTagsForUser(userId: string): Promise<QueryResult<UserTag[]>> {
  try {
    const data = await prisma.tag.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });

    return {
      data,
      degraded: false,
    };
  } catch (error) {
    console.error("Failed to list tags for dashboard", {
      userId,
      error,
    });

    return {
      data: [],
      degraded: true,
    };
  }
}
