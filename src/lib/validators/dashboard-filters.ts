import { ApplicationStatus } from "@prisma/client";
import { z } from "zod";

import {
  DASHBOARD_DEFAULT_PAGE_SIZE,
  DASHBOARD_PAGE_SIZE_VALUES,
} from "@/lib/constants/dashboard-pagination";
import {
  DASHBOARD_DEFAULT_SORT,
  DASHBOARD_SORT_VALUES,
} from "@/lib/constants/dashboard-sort";

const applicationStatusValues = Object.values(ApplicationStatus) as [
  ApplicationStatus,
  ...ApplicationStatus[],
];

const DASHBOARD_MAX_PAGE = 1000;

const positiveIntParam = z.preprocess((value) => {
  if (value === undefined || value === "") {
    return undefined;
  }

  if (typeof value === "string") {
    return Number(value);
  }

  return value;
}, z.number().int().min(1));

const pageParam = z.preprocess((value) => {
  if (value === undefined || value === "") {
    return undefined;
  }

  if (typeof value === "string") {
    return Number(value);
  }

  return value;
}, z.number().int().min(1).max(DASHBOARD_MAX_PAGE));

const pageSizeParam = z.preprocess((value) => {
  if (value === undefined || value === "") {
    return undefined;
  }

  if (typeof value === "string") {
    return Number(value);
  }

  return value;
}, z.number().int().refine((value) => DASHBOARD_PAGE_SIZE_VALUES.includes(value as (typeof DASHBOARD_PAGE_SIZE_VALUES)[number]), {
  message: "Invalid page size",
}));

export const dashboardFiltersSchema = z.object({
  q: z.string().trim().max(100).optional().transform((value) => value || undefined),
  status: z
    .enum(["ALL", ...applicationStatusValues])
    .optional()
    .default("ALL"),
  tag: z.string().trim().max(50).optional().transform((value) => value || undefined),
  sort: z.enum(DASHBOARD_SORT_VALUES).optional().default(DASHBOARD_DEFAULT_SORT),
  page: pageParam.optional().default(1),
  pageSize: pageSizeParam.optional().default(DASHBOARD_DEFAULT_PAGE_SIZE),
});

export type DashboardFilters = z.infer<typeof dashboardFiltersSchema>;
