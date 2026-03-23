import Link from "next/link";
import { notFound } from "next/navigation";

import {
  trackDemoJobPostingAction,
  untrackDemoJobPostingAction,
} from "@/server/applications/actions";
import { getTrackedApplicationForPosting } from "@/server/applications/queries";
import { requireUserSession } from "@/server/auth/session";
import { getDemoJobPostingBySlug } from "@/server/job-postings/catalog";

type Props = {
  params: Promise<{ slug: string }>;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

function formatStatusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default async function JobPostingDetailPage({ params }: Props) {
  const [session, { slug }] = await Promise.all([requireUserSession(), params]);
  const posting = getDemoJobPostingBySlug(slug);

  if (!posting) {
    notFound();
  }

  const trackedApplication = await getTrackedApplicationForPosting(session.user.id, posting);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-800">
          ← Back to dashboard
        </Link>
      </div>

      <article className="space-y-6 rounded-lg border border-zinc-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-500">{posting.company}</p>
            <h1 className="text-2xl font-semibold text-zinc-900">{posting.role}</h1>
            <p className="mt-1 text-zinc-600">{posting.location}</p>
          </div>
          <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium">
            {formatStatusLabel(posting.status)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {trackedApplication ? (
            <>
              <Link
                href={`/dashboard/${trackedApplication.id}`}
                className="rounded-md bg-black px-4 py-2 text-sm text-white"
              >
                View tracked application
              </Link>

              <form action={untrackDemoJobPostingAction}>
                <input type="hidden" name="slug" value={posting.slug} />
                <button
                  type="submit"
                  className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-700"
                >
                  Untrack posting
                </button>
              </form>
            </>
          ) : (
            <form action={trackDemoJobPostingAction}>
              <input type="hidden" name="slug" value={posting.slug} />
              <button
                type="submit"
                className="rounded-md bg-black px-4 py-2 text-sm text-white"
              >
                Track this posting
              </button>
            </form>
          )}

          <Link
            href={posting.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm"
          >
            Open source link
          </Link>
        </div>

        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">Applied</dt>
            <dd className="mt-1 text-sm">{dateFormatter.format(new Date(posting.appliedDate))}</dd>
          </div>

          {posting.nextActionDate ? (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                Next action
              </dt>
              <dd className="mt-1 text-sm">
                {dateFormatter.format(new Date(posting.nextActionDate))}
              </dd>
            </div>
          ) : null}

          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">Salary</dt>
            <dd className="mt-1 text-sm">{posting.salaryRange ?? "Salary not listed"}</dd>
          </div>

          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">Source</dt>
            <dd className="mt-1 truncate text-sm text-zinc-600">{posting.jobUrl}</dd>
          </div>

          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">Overview</dt>
            <dd className="mt-1 text-sm leading-6 text-zinc-700">{posting.summary}</dd>
          </div>

          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">Tags</dt>
            <dd className="mt-2 flex flex-wrap gap-1">
              {posting.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-zinc-100 px-2 py-1 text-xs">
                  {tag}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </article>
    </main>
  );
}
