"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";

import { signUpAction } from "@/server/auth/actions";
import type { SignUpState } from "@/server/auth/actions";

const initialSignUpState: SignUpState = {
  success: false,
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Creating account..." : "Create account"}
    </button>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const [state, action] = useFormState(signUpAction, initialSignUpState);

  useEffect(() => {
    if (state.success) {
      router.push("/sign-in?registered=1");
    }
  }, [router, state.success]);

  return (
    <form action={action} className="space-y-4 rounded-lg border border-zinc-200 p-6">
      <div className="space-y-1">
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-700"
        />
        {state.fieldErrors?.name?.[0] ? (
          <p className="text-sm text-red-600">{state.fieldErrors.name[0]}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-700"
        />
        {state.fieldErrors?.email?.[0] ? (
          <p className="text-sm text-red-600">{state.fieldErrors.email[0]}</p>
        ) : null}
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
          className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-700"
        />
        {state.fieldErrors?.password?.[0] ? (
          <p className="text-sm text-red-600">{state.fieldErrors.password[0]}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="confirmPassword" className="block text-sm font-medium">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-700"
        />
        {state.fieldErrors?.confirmPassword?.[0] ? (
          <p className="text-sm text-red-600">{state.fieldErrors.confirmPassword[0]}</p>
        ) : null}
      </div>

      {state.message && !state.success ? <p className="text-sm text-red-600">{state.message}</p> : null}

      <div className="flex items-center justify-between gap-3">
        <SubmitButton />
        <p className="text-sm text-zinc-600">
          Already have an account?{" "}
          <Link href="/sign-in" className="underline">
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
}
