"use client";

import { useActionState, useRef, useState } from "react";
import { updateProfile, type ProfileFormState } from "@/lib/actions/profile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { toast } from "sonner";
import { ImagePlus } from "lucide-react";

interface SettingsFormProps {
  profile: {
    display_name: string | null;
    username: string;
    avatar_url: string | null;
  };
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState(
    async (prevState: ProfileFormState, formData: FormData) => {
      const result = await updateProfile(prevState, formData);
      if (result?.success) {
        toast.success("Profile updated");
      }
      return result;
    },
    null
  );

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      e.target.value = "";
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
  }

  const displayName = profile.display_name ?? profile.username;

  return (
    <form action={formAction} className="space-y-6">
      {/* Avatar */}
      <div className="space-y-2">
        <Label className="section-label">Avatar</Label>
        <div className="flex items-center gap-4">
          <UserAvatar
            src={avatarPreview ?? profile.avatar_url}
            name={displayName}
            size="lg"
          />
          <div>
            <input
              ref={fileInputRef}
              type="file"
              name="avatar"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="mr-2 h-4 w-4" />
              Change
            </Button>
          </div>
        </div>
        {state?.errors?.avatar && (
          <p className="text-sm text-red-500">{state.errors.avatar[0]}</p>
        )}
      </div>

      {/* Display Name */}
      <div className="space-y-2">
        <Label htmlFor="display_name" className="section-label">Display Name</Label>
        <Input
          id="display_name"
          name="display_name"
          defaultValue={profile.display_name ?? ""}
          required
        />
        {state?.errors?.display_name && (
          <p className="text-sm text-red-500">{state.errors.display_name[0]}</p>
        )}
      </div>

      {/* Username */}
      <div className="space-y-2">
        <Label htmlFor="username" className="section-label">Username</Label>
        <Input
          id="username"
          name="username"
          defaultValue={profile.username}
          required
        />
        <p className="text-xs text-muted-foreground">
          Only letters, numbers, hyphens, and underscores. Min 3 characters.
        </p>
        {state?.errors?.username && (
          <p className="text-sm text-red-500">{state.errors.username[0]}</p>
        )}
      </div>

      {state?.errors?.form && (
        <p className="text-sm text-red-500">{state.errors.form[0]}</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
