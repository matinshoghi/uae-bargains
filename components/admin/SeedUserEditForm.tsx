"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateSeedUser } from "@/lib/actions/seed";
import type { SeedUserWithProfile } from "@/lib/queries/seed";

interface SeedUserEditFormProps {
  user: SeedUserWithProfile;
}

export function SeedUserEditForm({ user }: SeedUserEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [username, setUsername] = useState(user.profiles.username);
  const [avatarUrl, setAvatarUrl] = useState(user.profiles.avatar_url ?? "");
  const [notes, setNotes] = useState(user.notes ?? "");
  const [createdAt, setCreatedAt] = useState(
    user.profiles.created_at
      ? new Date(user.profiles.created_at).toISOString().slice(0, 16)
      : ""
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      const result = await updateSeedUser(user.user_id, {
        username: username.trim(),
        avatar_url: avatarUrl.trim() || null,
        notes: notes.trim() || null,
        created_at: createdAt ? new Date(createdAt).toISOString() : null,
      });

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Seed user updated");
      router.push("/admin/seed-users");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Username */}
      <div className="space-y-2">
        <Label htmlFor="edit-username" className="section-label">
          Username <span className="text-red-500">*</span>
        </Label>
        <Input
          id="edit-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="sarah_ahmed"
          required
        />
        <p className="text-xs text-muted-foreground">
          3-30 characters. Letters, numbers, hyphens, underscores only.
        </p>
      </div>

      {/* Avatar URL */}
      <div className="space-y-2">
        <Label htmlFor="edit-avatar-url" className="section-label">
          Avatar URL
        </Label>
        <Input
          id="edit-avatar-url"
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://i.pravatar.cc/150?u=sarah"
        />
        <p className="text-xs text-muted-foreground">
          Use pravatar.cc, ui-avatars.com, or any public avatar URL.
        </p>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="edit-notes" className="section-label">
          Notes
        </Label>
        <Input
          id="edit-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Persona: tech-savvy, posts electronics deals"
        />
      </div>

      {/* Created Date */}
      <div className="space-y-2">
        <Label htmlFor="edit-created-at" className="section-label">
          Created Date
        </Label>
        <Input
          id="edit-created-at"
          type="datetime-local"
          value={createdAt}
          onChange={(e) => setCreatedAt(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          The public-facing join date for this user.
        </p>
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/seed-users")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
