"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) throw new Error("Not authorized");

  return user;
}

export async function toggleFeaturedDeal(
  dealId: string,
  featured: boolean
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const { error } = await admin
      .from("deals")
      .update({ is_featured: featured })
      .eq("id", dealId);

    if (error) return { error: error.message };

    revalidatePath("/");
    revalidatePath("/admin/featured");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}
