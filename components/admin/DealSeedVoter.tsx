"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { syncDealVotesAsSeedUsers } from "@/lib/actions/seed";
import type { SeedUserWithProfile } from "@/lib/queries/seed";

type Props = {
  dealId: string;
  seedUsers: SeedUserWithProfile[];
  alreadyVotedIds: string[];
};

export function DealSeedVoter({ dealId, seedUsers, alreadyVotedIds }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(alreadyVotedIds)
  );

  const alreadyVoted = new Set(alreadyVotedIds);

  function handleSubmit() {
    startTransition(async () => {
      const result = await syncDealVotesAsSeedUsers(dealId, Array.from(selected));
      if (result?.error) {
        toast.error(result.error);
      } else {
        const added = result?.added ?? 0;
        const removed = result?.removed ?? 0;
        if (added === 0 && removed === 0) {
          toast.success("No vote changes");
        } else {
          const changes = [
            added > 0 ? `${added} added` : null,
            removed > 0 ? `${removed} removed` : null,
          ]
            .filter(Boolean)
            .join(", ");
          toast.success(`Seed upvotes updated (${changes})`);
        }
        setOpen(false);
        router.refresh();
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <ThumbsUp className="h-3.5 w-3.5" />
        Seed deal upvotes
        {alreadyVotedIds.length > 0 && (
          <span className="text-xs">({alreadyVotedIds.length} seeded)</span>
        )}
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <ThumbsUp className="h-4 w-4" />
          Seed Deal Upvotes
        </h3>
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => setSelected(new Set(seedUsers.map((u) => u.user_id)))}
            className="text-foreground underline underline-offset-2 hover:opacity-70"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-muted-foreground underline underline-offset-2 hover:opacity-70"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {seedUsers.map((u) => {
          const voted = alreadyVoted.has(u.user_id);
          return (
            <label
              key={u.user_id}
              className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                selected.has(u.user_id)
                  ? "border-foreground bg-accent"
                  : "border-border hover:bg-accent/50"
              } ${voted ? "opacity-60" : ""}`}
            >
              <input
                type="checkbox"
                checked={selected.has(u.user_id)}
                onChange={() => {
                  setSelected((prev) => {
                    const next = new Set(prev);
                    if (next.has(u.user_id)) next.delete(u.user_id);
                    else next.add(u.user_id);
                    return next;
                  });
                }}
                className="h-3.5 w-3.5 rounded border-border"
              />
              <span className="font-medium">@{u.profiles.username}</span>
              {voted && (
                <span className="text-[10px] text-muted-foreground">(voted)</span>
              )}
            </label>
          );
        })}
      </div>
      {seedUsers.length === 0 && (
        <p className="text-sm text-muted-foreground">No seed users created yet.</p>
      )}
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Saving..." : "Save Upvotes"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
