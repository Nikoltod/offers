"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { signIn } from "next-auth/react";

import { signInSchema } from "@/lib/validators/auth";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const registered = useMemo(() => searchParams.get("registered") === "1", [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid credentials");
      return;
    }

    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    setIsSubmitting(false);

    if (!result || result.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push(result.url ?? "/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-4 rounded-lg border border-zinc-200 p-6">
      {registered ? (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Account created successfully. You can sign in now.
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-700"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-700"
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex items-center justify-between gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-sm text-zinc-600">
            Need an account?{" "}
            <Link href="/sign-up" className="underline">
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
