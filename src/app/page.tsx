import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16">
      <div className="space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">Job Application Tracker</h1>
        <p className="text-lg text-zinc-600">
          Track applications, monitor pipeline status, and prepare for interviews in one place.
        </p>
        <div className="flex gap-3">
          <Link
            href="/sign-in"
            className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-md border border-zinc-300 px-4 py-2 hover:bg-zinc-100"
          >
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}
