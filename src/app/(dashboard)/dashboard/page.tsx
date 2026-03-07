import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/server/auth/options";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 px-6 py-10">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-zinc-600">Authenticated as {session.user.email}</p>
      <div className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-700">
        Authentication slice is complete. Next step adds application CRUD.
      </div>
    </main>
  );
}
