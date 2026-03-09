"use client";

import { ApplicationStatus } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

import { createApplicationAction } from "@/server/applications/actions";
import type { CreateApplicationState } from "@/server/applications/actions";

const initialCreateApplicationState: CreateApplicationState = {
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
      {pending ? "Saving..." : "Add application"}
    </button>
  );
}

const statusOptions = Object.values(ApplicationStatus);

export function CreateApplicationForm() {
  const [state, action] = useFormState(createApplicationAction, initialCreateApplicationState);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (state.success) {
      setFormKey((key) => key + 1);
    }
  }, [state.success]);

  const statusLabelMap = useMemo(
    () =>
      new Map(
        statusOptions.map((status) => [status, status.charAt(0) + status.slice(1).toLowerCase()]),
      ),
    [],
  );

  return (
    <form key={formKey} action={action} className="space-y-4 rounded-lg border border-zinc-200 p-4">
      <h2 className="text-lg font-semibold">New application</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="company" className="block text-sm font-medium">
            Company
          </label>
          <input
            id="company"
            name="company"
            required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-700"
          />
          {state.fieldErrors?.company?.[0] ? (
            <p className="text-sm text-red-600">{state.fieldErrors.company[0]}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label htmlFor="role" className="block text-sm font-medium">
            Role
          </label>
          <input
            id="role"
            name="role"
            required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-700"
          />
          {state.fieldErrors?.role?.[0] ? (
            <p className="text-sm text-red-600">{state.fieldErrors.role[0]}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label htmlFor="location" className="block text-sm font-medium">
            Location
          </label>
          <input
            id="location"
            name="location"
            required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-700"
          />
          {state.fieldErrors?.location?.[0] ? (
            <p className="text-sm text-red-600">{state.fieldErrors.location[0]}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label htmlFor="salaryRange" className="block text-sm font-medium">
            Salary range (optional)
          </label>
          <input
            id="salaryRange"
            name="salaryRange"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-700"
          />
          {state.fieldErrors?.salaryRange?.[0] ? (
            <p className="text-sm text-red-600">{state.fieldErrors.salaryRange[0]}</p>
          ) : null}
        </div>

        <div className="space-y-1 md:col-span-2">
          <label htmlFor="jobUrl" className="block text-sm font-medium">
            Job URL
          </label>
          <input
            id="jobUrl"
            name="jobUrl"
            required
            type="url"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-700"
          />
          {state.fieldErrors?.jobUrl?.[0] ? (
            <p className="text-sm text-red-600">{state.fieldErrors.jobUrl[0]}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label htmlFor="status" className="block text-sm font-medium">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={ApplicationStatus.WISHLIST}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-700"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {statusLabelMap.get(status)}
              </option>
            ))}
          </select>
          {state.fieldErrors?.status?.[0] ? (
            <p className="text-sm text-red-600">{state.fieldErrors.status[0]}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label htmlFor="appliedDate" className="block text-sm font-medium">
            Applied date
          </label>
          <input
            id="appliedDate"
            name="appliedDate"
            required
            type="date"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-700"
          />
          {state.fieldErrors?.appliedDate?.[0] ? (
            <p className="text-sm text-red-600">{state.fieldErrors.appliedDate[0]}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label htmlFor="nextActionDate" className="block text-sm font-medium">
            Next action date (optional)
          </label>
          <input
            id="nextActionDate"
            name="nextActionDate"
            type="date"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-700"
          />
          {state.fieldErrors?.nextActionDate?.[0] ? (
            <p className="text-sm text-red-600">{state.fieldErrors.nextActionDate[0]}</p>
          ) : null}
        </div>

        <div className="space-y-1 md:col-span-2">
          <label htmlFor="tags" className="block text-sm font-medium">
            Tags (comma separated, optional)
          </label>
          <input
            id="tags"
            name="tags"
            placeholder="remote, backend, referral"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-700"
          />
          {state.fieldErrors?.tags?.[0] ? (
            <p className="text-sm text-red-600">{state.fieldErrors.tags[0]}</p>
          ) : null}
        </div>

        <div className="space-y-1 md:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-700"
          />
          {state.fieldErrors?.notes?.[0] ? (
            <p className="text-sm text-red-600">{state.fieldErrors.notes[0]}</p>
          ) : null}
        </div>
      </div>

      {state.message ? (
        <p className={`text-sm ${state.success ? "text-green-700" : "text-red-600"}`}>{state.message}</p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
