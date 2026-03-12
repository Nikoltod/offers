import { Prisma } from "@prisma/client";

import { DASHBOARD_SORT_CONFIG } from "@/lib/constants/dashboard-sort";
import { DashboardFilters } from "@/lib/validators/dashboard-filters";
import { prisma } from "@/server/db/prisma";

type ApplicationQueryFilters = DashboardFilters;
type QueryResult<TData> = {
  data: TData;
  degraded: boolean;
};

type PaginatedApplications = {
  items: ApplicationWithTags[];
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
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
  return DASHBOARD_SORT_CONFIG[sort].orderBy;
}

export async function listApplicationsForUser(
  userId: string,
  filters: ApplicationQueryFilters,
): Promise<QueryResult<PaginatedApplications>> {
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
    const skip = (filters.page - 1) * filters.pageSize;

    const [items, totalCount] = await prisma.$transaction([
      prisma.application.findMany({
        where,
        include: {
          applicationTags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: mapSortToOrderBy(filters.sort),
        skip,
        take: filters.pageSize,
      }),
      prisma.application.count({ where }),
    ]);

    const totalPages = totalCount === 0 ? 1 : Math.ceil(totalCount / filters.pageSize);

    return {
      data: {
        items,
        totalCount,
        totalPages,
        page: filters.page,
        pageSize: filters.pageSize,
      },
      degraded: false,
    };
  } catch (error) {
    console.error("Failed to list applications for dashboard", {
      userId,
      filters,
      error,
    });

    return {
      data: {
        items: [],
        totalCount: 0,
        totalPages: 1,
        page: filters.page,
        pageSize: filters.pageSize,
      },
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
