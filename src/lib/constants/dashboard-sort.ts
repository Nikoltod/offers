export const DASHBOARD_SORT_CONFIG = {
  "created-desc": {
    label: "Newest created",
    orderBy: { createdAt: "desc" as const },
  },
  "created-asc": {
    label: "Oldest created",
    orderBy: { createdAt: "asc" as const },
  },
  "applied-desc": {
    label: "Newest applied",
    orderBy: { appliedDate: "desc" as const },
  },
  "applied-asc": {
    label: "Oldest applied",
    orderBy: { appliedDate: "asc" as const },
  },
  "company-asc": {
    label: "Company A-Z",
    orderBy: { company: "asc" as const },
  },
  "company-desc": {
    label: "Company Z-A",
    orderBy: { company: "desc" as const },
  },
} as const;

export type DashboardSort = keyof typeof DASHBOARD_SORT_CONFIG;

export const DASHBOARD_SORT_VALUES = Object.keys(DASHBOARD_SORT_CONFIG) as [
  DashboardSort,
  ...DashboardSort[],
];

export const DASHBOARD_DEFAULT_SORT: DashboardSort = "created-desc";
