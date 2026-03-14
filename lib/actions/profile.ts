"use server";

import { createClient } from "@/lib/supabase/server";
import { notifyFormSubmitted } from "@/lib/notifications";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";

const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Max 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, hyphens, and underscores"),
});

export type ProfileFormState = {
  errors?: Record<string, string[]>;
  success?: boolean;
} | null;

export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be signed in");

  const parsed = updateProfileSchema.safeParse({
    username: formData.get("username"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  // Handle avatar upload or removal
  let avatarUpdate: { avatar_url: string | null } | undefined;
  const avatarFile = formData.get("avatar") as File | null;
  const shouldRemoveAvatar = formData.get("remove_avatar") === "1";

  if (avatarFile && avatarFile.size > 0) {
    const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
    if (avatarFile.size > MAX_AVATAR_SIZE) {
      return { errors: { avatar: ["Avatar must be under 5MB"] } };
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(avatarFile.type)) {
      return {
        errors: { avatar: ["Only JPEG, PNG, and WebP images are accepted"] },
      };
    }

    const fileExt = avatarFile.name.split(".").pop();
    const filePath = `avatars/${user.id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("deal-images")
      .upload(filePath, avatarFile, { upsert: true });

    if (uploadError) {
      return { errors: { avatar: ["Failed to upload avatar"] } };
    }

    const { data: publicUrl } = supabase.storage
      .from("deal-images")
      .getPublicUrl(filePath);
    avatarUpdate = { avatar_url: publicUrl.publicUrl };
  } else if (shouldRemoveAvatar) {
    avatarUpdate = { avatar_url: null };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      ...parsed.data,
      ...avatarUpdate,
    })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { errors: { username: ["This username is already taken"] } };
    }
    return { errors: { form: [error.message] } };
  }

  after(() =>
    notifyFormSubmitted(
      "Profile Settings",
      {
        username: parsed.data.username,
        avatar_uploaded: Boolean(avatarFile && avatarFile.size > 0),
        avatar_removed: shouldRemoveAvatar,
      },
      user.id
    )
  );

  revalidatePath("/settings");
  revalidatePath(`/user/${parsed.data.username}`);
  return { success: true };
}
