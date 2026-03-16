import Link from "next/link";
import { ApplicationStatus } from "@prisma/client";
import { redirect } from "next/navigation";

import { CreateApplicationForm } from "./create-application-form";
import {
  DASHBOARD_DEFAULT_PAGE_SIZE,
  DASHBOARD_PAGE_SIZE_VALUES,
} from "@/lib/constants/dashboard-pagination";
import { DASHBOARD_SORT_CONFIG, DashboardSort } from "@/lib/constants/dashboard-sort";
import { dashboardFiltersSchema } from "@/lib/validators/dashboard-filters";
import { requireUserSession } from "@/server/auth/session";
import { listApplicationsForUser, listTagsForUser } from "@/server/applications/queries";

type DashboardPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

const statusOptions = ["ALL", ...Object.values(ApplicationStatus)] as const;

const sortOptions = Object.entries(DASHBOARD_SORT_CONFIG).map(([value, config]) => ({
  value: value as DashboardSort,
  label: config.label,
}));

function firstQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatStatusLabel(status: string) {
  if (status === "ALL") {
    return "All statuses";
  }

  return status.charAt(0) + status.slice(1).toLowerCase();
}

function buildDashboardHref(
  filters: {
    q?: string;
    status: string;
    tag?: string;
    sort: string;
    pageSize: number;
  },
  page: number,
) {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }

  if (filters.status !== "ALL") {
    params.set("status", filters.status);
  }

  if (filters.tag) {
    params.set("tag", filters.tag);
  }

  if (filters.sort) {
    params.set("sort", filters.sort);
  }

  if (filters.pageSize !== DASHBOARD_DEFAULT_PAGE_SIZE) {
    params.set("pageSize", String(filters.pageSize));
  }

  params.set("page", String(page));

  return `/dashboard?${params.toString()}`;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await requireUserSession();

  const parsedFilters = dashboardFiltersSchema.safeParse({
    q: firstQueryValue(searchParams?.q),
    status: firstQueryValue(searchParams?.status),
    tag: firstQueryValue(searchParams?.tag),
    sort: firstQueryValue(searchParams?.sort),
    page: firstQueryValue(searchParams?.page),
    pageSize: firstQueryValue(searchParams?.pageSize),
  });

  const filters = parsedFilters.success
    ? parsedFilters.data
    : dashboardFiltersSchema.parse({});

  const [applicationsResult, tagsResult] = await Promise.all([
    listApplicationsForUser(session.user.id, filters),
    listTagsForUser(session.user.id),
  ]);

  const applications = applicationsResult.data.items;
  const totalCount = applicationsResult.data.totalCount;
  const page = applicationsResult.data.page;
  const totalPages = applicationsResult.data.totalPages;
  const hasPreviousPage = applicationsResult.data.hasPreviousPage;
  const hasNextPage = applicationsResult.data.hasNextPage;
  const tags = tagsResult.data;
  const isDegraded = applicationsResult.degraded || tagsResult.degraded;

  const previousPageHref = buildDashboardHref(filters, Math.max(1, page - 1));
  const nextPageHref = buildDashboardHref(filters, Math.min(totalPages, page + 1));
  
  if (!isDegraded && filters.page !== page) {
    redirect(buildDashboardHref(filters, page));
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 px-6 py-10">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {isDegraded ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Some dashboard data is temporarily unavailable. Please refresh in a moment.
        </div>
      ) : null}

      <CreateApplicationForm />

      <section className="rounded-lg border border-zinc-200 p-4">
        <form method="get" className="grid gap-4 md:grid-cols-4">
          <input type="hidden" name="page" value="1" />

          <div className="space-y-1 md:col-span-2">
            <label htmlFor="q" className="block text-sm font-medium">
              Search
            </label>
            <input
              id="q"
              name="q"
              defaultValue={filters.q}
              placeholder="Company or role"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-700"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="status" className="block text-sm font-medium">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={filters.status}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-700"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {formatStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="sort" className="block text-sm font-medium">
              Sort
            </label>
            <select
              id="sort"
              name="sort"
              defaultValue={filters.sort}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-700"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="pageSize" className="block text-sm font-medium">
              Per page
            </label>
            <select
              id="pageSize"
              name="pageSize"
              defaultValue={String(filters.pageSize)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-700"
            >
              {DASHBOARD_PAGE_SIZE_VALUES.map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label htmlFor="tag" className="block text-sm font-medium">
              Tag
            </label>
            <select
              id="tag"
              name="tag"
              defaultValue={filters.tag ?? ""}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-700"
            >
              <option value="">All tags</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.name}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex items-end gap-2">
            <button type="submit" className="rounded-md bg-black px-4 py-2 text-white">
              Apply
            </button>
            <Link href="/dashboard" className="rounded-md border border-zinc-300 px-4 py-2 text-sm">
              Reset
            </Link>
          </div>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Your applications ({totalCount})</h2>

        {applications.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-700">
            No applications yet. Add your first one above.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Applied</th>
                  <th className="px-4 py-3 font-medium">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {applications.map((application) => (
                  <tr key={application.id}>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/${application.id}`}
                        className="underline"
                      >
                        {application.company}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{application.role}</td>
                    <td className="px-4 py-3">{application.status}</td>
                    <td className="px-4 py-3">
                      {new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
                      }).format(application.appliedDate)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {application.applicationTags.length === 0
                          ? "-"
                          : application.applicationTags.map((applicationTag) => (
                              <span
                                key={applicationTag.tagId}
                                className="rounded-full bg-zinc-100 px-2 py-1 text-xs"
                              >
                                {applicationTag.tag.name}
                              </span>
                            ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalCount > 0 ? (
          <div className="flex items-center justify-between text-sm text-zinc-700">
            <p>
              Page {page} of {totalPages}
            </p>

            <div className="flex items-center gap-2">
              {hasPreviousPage ? (
                <Link
                  href={previousPageHref}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
                >
                  Previous
                </Link>
              ) : (
                <span className="rounded-md border border-zinc-200 px-3 py-1.5 text-zinc-400">
                  Previous
                </span>
              )}

              {hasNextPage ? (
                <Link
                  href={nextPageHref}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
                >
                  Next
                </Link>
              ) : (
                <span className="rounded-md border border-zinc-200 px-3 py-1.5 text-zinc-400">
                  Next
                </span>
              )}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
