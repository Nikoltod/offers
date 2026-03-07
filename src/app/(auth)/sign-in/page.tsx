import { SignInForm } from "./sign-in-form";

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-bold">Sign in</h1>
        <p className="text-zinc-600">Continue to your job application dashboard.</p>
      </div>
      <SignInForm />
    </main>
  );
}
