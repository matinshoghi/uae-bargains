"use client";

import { useActionState, useRef, useEffect } from "react";
import { createSeedUser, type SeedFormState } from "@/lib/actions/seed";

export function SeedUserForm() {
  const [state, action, isPending] = useActionState<SeedFormState, FormData>(
    createSeedUser,
    null
  );

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="display_name" className="block text-sm font-medium">
            Display Name <span className="text-red-500">*</span>
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            required
            placeholder="Sarah Ahmed"
            className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            placeholder="sarah_ahmed"
            className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            3-30 characters. Letters, numbers, hyphens, underscores only.
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="avatar_url" className="block text-sm font-medium">
          Avatar URL <span className="text-muted-foreground">(optional)</span>
        </label>
        <input
          id="avatar_url"
          name="avatar_url"
          type="url"
          placeholder="https://i.pravatar.cc/150?u=sarah"
          className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Use pravatar.cc, ui-avatars.com, or any public avatar URL.
        </p>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium">
          Notes <span className="text-muted-foreground">(optional)</span>
        </label>
        <input
          id="notes"
          name="notes"
          type="text"
          placeholder="Persona: tech-savvy, posts electronics deals"
          className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      {state?.success && (
        <p className="text-sm text-green-600">Seed user created successfully.</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Creating..." : "Create Seed User"}
      </button>
    </form>
  );
}
