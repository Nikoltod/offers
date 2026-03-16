export const DASHBOARD_PAGE_SIZE_VALUES = [10, 20, 50] as const;

export type DashboardPageSize = (typeof DASHBOARD_PAGE_SIZE_VALUES)[number];

export const DASHBOARD_DEFAULT_PAGE_SIZE: DashboardPageSize = 20;