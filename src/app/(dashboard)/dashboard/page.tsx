import Link from "next/link";

import { CreateApplicationForm } from "./create-application-form";
import { requireUserSession } from "@/server/auth/session";
import { listApplicationsForUser } from "@/server/applications/queries";

export default async function DashboardPage() {
  const session = await requireUserSession();
  const applications = await listApplicationsForUser(session.user.id);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 px-6 py-10">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <CreateApplicationForm />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Your applications ({applications.length})</h2>

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
                        href={application.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
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
      </section>
    </main>
  );
}
