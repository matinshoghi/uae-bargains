"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TriangleAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { permanentlyDeleteDeal } from "@/lib/actions/admin";

const CONFIRM_PHRASE = "DELETE";

interface DeleteDealButtonProps {
  dealId: string;
  dealTitle: string;
  commentCount: number;
}

export function DeleteDealButton({
  dealId,
  dealTitle,
  commentCount,
}: DeleteDealButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [isPending, startTransition] = useTransition();

  const isConfirmed = confirmInput === CONFIRM_PHRASE;

  function handleOpenChange(next: boolean) {
    if (!next) setConfirmInput("");
    setOpen(next);
  }

  function handleDelete() {
    if (!isConfirmed) return;
    startTransition(async () => {
      const result = await permanentlyDeleteDeal(dealId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setOpen(false);
      toast.success("Deal permanently deleted");
      router.push("/admin/moderation");
    });
  }

  return (
    <>
      {/* Danger zone section */}
      <div className="mt-12 rounded-lg border border-red-200 bg-red-50/40 p-5 dark:border-red-900/50 dark:bg-red-950/20">
        <div className="flex items-start gap-3">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-500" strokeWidth={1.5} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">
              Danger Zone
            </p>
            <p className="mt-1 text-xs leading-relaxed text-red-600/80 dark:text-red-400/70">
              Permanently deletes this deal and all associated data — comments,
              votes, Telegram push records, and the uploaded image. This cannot
              be undone.
            </p>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-3 rounded-md border border-red-400 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-600 hover:text-white dark:bg-transparent dark:hover:bg-red-700 dark:hover:text-white"
            >
              Permanently delete deal…
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation dialog */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md" showCloseButton={!isPending}>
          <DialogHeader>
            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
              <TriangleAlert className="h-5 w-5 text-red-600" strokeWidth={1.5} />
            </div>
            <DialogTitle className="text-base">
              Permanently delete this deal?
            </DialogTitle>
            <DialogDescription className="sr-only">
              Confirm permanent deletion of the deal.
            </DialogDescription>
          </DialogHeader>

          {/* What gets deleted */}
          <div className="rounded-md border border-border bg-muted/40 p-3.5 text-sm">
            <p className="font-medium leading-snug text-foreground">
              &ldquo;{dealTitle}&rdquo;
            </p>
            <ul className="mt-2.5 space-y-1 text-xs text-muted-foreground">
              <DeletionItem label="The deal post and all its fields" />
              <DeletionItem
                label={`${commentCount} comment${commentCount !== 1 ? "s" : ""} and all replies`}
              />
              <DeletionItem label="All upvotes and downvotes" />
              <DeletionItem label="Telegram push history" />
              <DeletionItem label="Uploaded image from storage" />
            </ul>
          </div>

          <p className="text-xs text-muted-foreground">
            This action is <strong className="text-foreground">permanent and irreversible</strong>.
            There is no way to recover this data.
          </p>

          {/* Typed confirmation */}
          <div className="space-y-1.5">
            <Label htmlFor="confirm-delete" className="text-xs font-medium">
              Type{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono font-bold text-foreground">
                DELETE
              </code>{" "}
              to confirm
            </Label>
            <Input
              id="confirm-delete"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
              spellCheck={false}
              disabled={isPending}
              className={
                confirmInput.length > 0 && !isConfirmed
                  ? "border-red-400 focus-visible:ring-red-400"
                  : ""
              }
            />
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
              className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!isConfirmed || isPending}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPending ? "Deleting…" : "Yes, permanently delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DeletionItem({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <span className="h-1 w-1 shrink-0 rounded-full bg-red-400" />
      {label}
    </li>
  );
}
