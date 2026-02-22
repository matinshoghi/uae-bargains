"use client";

import { useState, useTransition } from "react";
import { voteAsSeedUsers } from "@/lib/actions/seed";
import type { SeedUserWithProfile } from "@/lib/queries/seed";

export function SeedVoteForm({ users }: { users: SeedUserWithProfile[] }) {
  const [isPending, startTransition] = useTransition();
  const [dealId, setDealId] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedUserIds(new Set(users.map((u) => u.user_id)));
  };

  const selectNone = () => {
    setSelectedUserIds(new Set());
  };

  const extractDealId = (input: string): string => {
    const uuidMatch = input.match(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
    );
    return uuidMatch ? uuidMatch[0] : input.trim();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const id = extractDealId(dealId);
    if (!id) {
      setMessage({ type: "error", text: "Enter a deal ID or URL" });
      return;
    }
    if (selectedUserIds.size === 0) {
      setMessage({ type: "error", text: "Select at least one seed user" });
      return;
    }

    startTransition(async () => {
      const result = await voteAsSeedUsers(id, Array.from(selectedUserIds));
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: `${selectedUserIds.size} upvote(s) added.` });
        setSelectedUserIds(new Set());
        setDealId("");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="vote_deal_id" className="block text-sm font-medium">
          Deal ID or URL <span className="text-red-500">*</span>
        </label>
        <input
          id="vote_deal_id"
          type="text"
          value={dealId}
          onChange={(e) => setDealId(e.target.value)}
          placeholder="Paste deal URL or UUID"
          className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium">
            Seed Users to Upvote <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 text-xs">
            <button type="button" onClick={selectAll} className="text-foreground underline underline-offset-2 hover:opacity-70">
              Select all
            </button>
            <button type="button" onClick={selectNone} className="text-muted-foreground underline underline-offset-2 hover:opacity-70">
              Clear
            </button>
          </div>
        </div>

        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {users.map((u) => (
            <label
              key={u.user_id}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${
                selectedUserIds.has(u.user_id)
                  ? "border-foreground bg-accent"
                  : "border-border hover:bg-accent/50"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedUserIds.has(u.user_id)}
                onChange={() => toggleUser(u.user_id)}
                className="h-4 w-4 rounded border-border"
              />
              <span className="font-medium">
                {u.profiles.display_name || u.profiles.username}
              </span>
              <span className="text-muted-foreground">@{u.profiles.username}</span>
            </label>
          ))}
        </div>

        {users.length === 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            No seed users created yet. Create some first.
          </p>
        )}
      </div>

      {message && (
        <p className={`text-sm ${message.type === "error" ? "text-red-600" : "text-green-600"}`}>
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || users.length === 0}
        className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Voting..." : "Add Upvotes"}
      </button>
    </form>
  );
}
