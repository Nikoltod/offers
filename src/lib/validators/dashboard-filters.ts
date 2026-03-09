import { ApplicationStatus } from "@prisma/client";
import { z } from "zod";

import {
  DASHBOARD_DEFAULT_SORT,
  DASHBOARD_SORT_VALUES,
} from "@/lib/constants/dashboard-sort";

const applicationStatusValues = Object.values(ApplicationStatus) as [
  ApplicationStatus,
  ...ApplicationStatus[],
];

export const dashboardFiltersSchema = z.object({
  q: z.string().trim().max(100).optional().transform((value) => value || undefined),
  status: z
    .enum(["ALL", ...applicationStatusValues])
    .optional()
    .default("ALL"),
  tag: z.string().trim().max(50).optional().transform((value) => value || undefined),
  sort: z.enum(DASHBOARD_SORT_VALUES).optional().default(DASHBOARD_DEFAULT_SORT),
});

export type DashboardFilters = z.infer<typeof dashboardFiltersSchema>;
