import Link from "next/link";
import { ApplicationStatus } from "@prisma/client";
import { notFound } from "next/navigation";

import { deleteApplicationAction } from "@/server/applications/actions";
import { requireUserSession } from "@/server/auth/session";
import { getApplicationForUser } from "@/server/applications/queries";

type Props = {
  params: Promise<{ id: string }>;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

function statusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default async function ApplicationDetailPage({ params }: Props) {
  const [session, { id }] = await Promise.all([requireUserSession(), params]);
  const application = await getApplicationForUser(session.user.id, id);

  if (!application) {
    notFound();
  }

  const tags = application.applicationTags.map((at) => at.tag.name);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-800">
          ← Back to dashboard
        </Link>
      </div>

      <div className="space-y-6 rounded-lg border border-zinc-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">{application.company}</h1>
            <p className="mt-1 text-zinc-500">{application.role}</p>
          </div>
          <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium">
            {statusLabel(application.status)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <form action={deleteApplicationAction}>
            <input type="hidden" name="applicationId" value={application.id} />
            <button
              type="submit"
              className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-700"
            >
              {application.status === ApplicationStatus.WISHLIST
                ? "Untrack from wishlist"
                : "Delete application"}
            </button>
          </form>
        </div>

        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">Location</dt>
            <dd className="mt-1 text-sm">{application.location}</dd>
          </div>

          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">Applied</dt>
            <dd className="mt-1 text-sm">{dateFormatter.format(application.appliedDate)}</dd>
          </div>

          {application.salaryRange ? (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                Salary range
              </dt>
              <dd className="mt-1 text-sm">{application.salaryRange}</dd>
            </div>
          ) : null}

          {application.nextActionDate ? (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                Next action
              </dt>
              <dd className="mt-1 text-sm">{dateFormatter.format(application.nextActionDate)}</dd>
            </div>
          ) : null}

          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Job posting
            </dt>
            <dd className="mt-1 text-sm">
              <a
                href={application.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-zinc-600"
              >
                {application.jobUrl}
              </a>
            </dd>
          </div>

          {application.notes ? (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm">{application.notes}</dd>
            </div>
          ) : null}

          {tags.length > 0 ? (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">Tags</dt>
              <dd className="mt-2 flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-zinc-100 px-2 py-1 text-xs">
                    {tag}
                  </span>
                ))}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>
    </main>
  );
}
