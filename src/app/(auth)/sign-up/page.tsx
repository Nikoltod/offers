import { SignUpForm } from "./sign-up-form";

export default function SignUpPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-bold">Create account</h1>
        <p className="text-zinc-600">Start tracking your job applications.</p>
      </div>
      <SignUpForm />
    </main>
  );
}
