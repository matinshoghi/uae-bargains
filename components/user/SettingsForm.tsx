"use client";

import { useActionState, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile, type ProfileFormState } from "@/lib/actions/profile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { toast } from "sonner";
import { ImagePlus, Trash2 } from "lucide-react";

interface SettingsFormProps {
  profile: {
    username: string;
    avatar_url: string | null;
  };
  authInfo: {
    signUpMethod: "email" | "google";
    email: string | null;
    isEmailVerified: boolean;
  };
}

export function SettingsForm({ profile, authInfo }: SettingsFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const usesGoogleSignUp = authInfo.signUpMethod === "google";

  const [state, formAction, isPending] = useActionState(
    async (prevState: ProfileFormState, formData: FormData) => {
      const result = await updateProfile(prevState, formData);
      if (result?.success) {
        toast.success("Profile updated");
        router.refresh();
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
    setRemoveAvatar(false);
  }

  function handleRemoveAvatar() {
    setAvatarPreview(null);
    setRemoveAvatar(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="rounded-sm border-2 border-foreground/15 bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="section-label">Sign-up method</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {usesGoogleSignUp
                ? "This account was created with Google Sign-In."
                : "This account was created with email and password."}
            </p>
          </div>
          <Badge variant={usesGoogleSignUp ? "outline" : "secondary"}>
            {usesGoogleSignUp ? "Google" : "Email"}
          </Badge>
        </div>

        {authInfo.email && (
          <div className="mt-3 border-t border-border/70 pt-3 text-sm">
            <span className="text-muted-foreground">
              {usesGoogleSignUp ? "Google account" : "Login email"}
            </span>
            <p className="font-medium break-all">{authInfo.email}</p>
          </div>
        )}

        {authInfo.signUpMethod === "email" && (
          <div className="mt-3 border-t border-border/70 pt-3 text-sm">
            <span className="text-muted-foreground">Email status</span>
            <p className="font-medium">
              {authInfo.isEmailVerified ? "Verified" : "Pending verification"}
            </p>
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className="space-y-2">
        <Label className="section-label">Avatar</Label>
        <div className="flex items-center gap-4">
          <UserAvatar
            src={removeAvatar ? null : (avatarPreview ?? profile.avatar_url)}
            name={profile.username}
            size="lg"
          />
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              name="avatar"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
            {removeAvatar && <input type="hidden" name="remove_avatar" value="1" />}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="mr-2 h-4 w-4" />
              Change
            </Button>
            {(avatarPreview || (!removeAvatar && profile.avatar_url)) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveAvatar}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </Button>
            )}
          </div>
        </div>
        {state?.errors?.avatar && (
          <p className="text-sm text-red-500">{state.errors.avatar[0]}</p>
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
