"use client";

import { useState, useTransition } from "react";
import { deleteAccount } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function DeleteAccountSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();

  const isConfirmed = confirmText === "DELETE";

  function handleOpen() {
    setConfirmText("");
    setIsOpen(true);
  }

  function handleClose() {
    if (isPending) return;
    setConfirmText("");
    setIsOpen(false);
  }

  function handleDelete() {
    if (!isConfirmed) return;
    startTransition(async () => {
      try {
        await deleteAccount();
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <div className="mt-12">
      {/* Section header */}
      <div className="mb-4 border-t border-red-200 pt-8">
        <h2 className="text-base font-semibold text-red-600">Danger Zone</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Irreversible actions that permanently affect your account.
        </p>
      </div>

      {/* Trigger row */}
      <div className="rounded-xl border border-red-200 bg-red-50/40 p-4 dark:bg-red-950/20">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Delete account</p>
            <p className="text-xs text-muted-foreground">
              Permanently remove your account and sign out.
            </p>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleOpen}
          >
            Delete account
          </Button>
        </div>
      </div>

      {/* Modal overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl">
            {/* Header */}
            <div className="mb-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold">Delete your account?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This action is permanent and cannot be undone.
              </p>
            </div>

            {/* Consequences */}
            <ul className="mb-5 space-y-2 rounded-lg bg-muted/50 px-4 py-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-muted-foreground">·</span>
                <span>
                  Your deals and comments will remain visible as{" "}
                  <span className="font-medium">[deleted]</span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-muted-foreground">·</span>
                <span>Your votes will be permanently removed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-muted-foreground">·</span>
                <span>Your profile and login credentials will be deleted</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-muted-foreground">·</span>
                <span>You will be signed out immediately</span>
              </li>
            </ul>

            {/* Confirmation input */}
            <div className="mb-5 space-y-2">
              <label
                htmlFor="delete-confirm"
                className="text-sm font-medium"
              >
                Type{" "}
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold">
                  DELETE
                </span>{" "}
                to confirm
              </label>
              <Input
                id="delete-confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                autoComplete="off"
                disabled={isPending}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                disabled={!isConfirmed || isPending}
                onClick={handleDelete}
              >
                {isPending ? "Deleting..." : "Delete my account"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
