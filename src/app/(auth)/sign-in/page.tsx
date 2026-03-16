import { Suspense } from "react";

import { SignInForm } from "./sign-in-form";

function SignInFormFallback() {
  return <div className="rounded-lg border border-zinc-200 p-6 text-sm text-zinc-600">Loading form...</div>;
}

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-bold">Sign in</h1>
        <p className="text-zinc-600">Continue to your job application dashboard.</p>
      </div>
      <Suspense fallback={<SignInFormFallback />}>
        <SignInForm />
      </Suspense>
    </main>
  );
}
