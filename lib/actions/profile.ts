"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateProfileSchema = z.object({
  display_name: z.string().min(1, "Display name is required").max(50, "Max 50 characters"),
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
    display_name: formData.get("display_name"),
    username: formData.get("username"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  // Handle avatar upload
  let avatar_url: string | undefined;
  const avatarFile = formData.get("avatar") as File | null;

  if (avatarFile && avatarFile.size > 0) {
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
    avatar_url = publicUrl.publicUrl;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      ...parsed.data,
      ...(avatar_url && { avatar_url }),
    })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { errors: { username: ["This username is already taken"] } };
    }
    return { errors: { form: [error.message] } };
  }

  revalidatePath("/settings");
  revalidatePath(`/user/${parsed.data.username}`);
  return { success: true };
}
