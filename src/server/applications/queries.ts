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
  hasPreviousPage: boolean;
  hasNextPage: boolean;
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
  return [DASHBOARD_SORT_CONFIG[sort].orderBy, { id: "asc" as const }];
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
    const totalCount = await prisma.application.count({ where });
    const totalPages = totalCount === 0 ? 1 : Math.ceil(totalCount / filters.pageSize);
    const currentPage = Math.min(filters.page, totalPages);
    const skip = (currentPage - 1) * filters.pageSize;

    const items = await prisma.application.findMany({
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
    });

    return {
      data: {
        items,
        totalCount,
        totalPages,
        page: currentPage,
        pageSize: filters.pageSize,
        hasPreviousPage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
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
        hasPreviousPage: false,
        hasNextPage: false,
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
