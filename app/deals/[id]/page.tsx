import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { DealDetail } from "@/components/deals/DealDetail";
import { CommentSection } from "@/components/comments/CommentSection";
import type { Metadata } from "next";
import type { DealWithRelations } from "@/lib/types";

type Props = {
  params: Promise<{ id: string }>;
};

async function getDeal(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("deals")
    .select(
      `
      *,
      profiles:user_id (username, display_name, avatar_url),
      categories:category_id (label, slug)
    `
    )
    .eq("id", id)
    .single();

  return data as DealWithRelations | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const deal = await getDeal(id);

  if (!deal || deal.status === "removed") {
    return { title: "Deal Not Found" };
  }

  return {
    title: deal.title,
    description: deal.description.slice(0, 160),
    openGraph: {
      title: deal.title,
      description: deal.description.slice(0, 160),
      images: deal.image_url ? [deal.image_url] : [],
    },
  };
}

export default async function DealPage({ params }: Props) {
  const { id } = await params;
  const deal = await getDeal(id);

  if (!deal) {
    notFound();
  }

  // Fetch current user for auth + admin check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    isAdmin = !!profile?.is_admin;
  }

  // Show a simple notice for removed deals (admins can still see + act on them)
  if (deal.status === "removed" && !isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-sm border-2 border-dashed border-foreground/15 p-8 text-center text-muted-foreground">
          <p className="text-lg font-medium">This deal has been removed</p>
          <p className="mt-1 text-sm">
            {deal.removed_by === "admin"
              ? "This deal was removed by a moderator."
              : "The author deleted this deal."}
          </p>
        </div>
      </div>
    );
  }

  let userVote: 1 | -1 | null = null;
  if (user) {
    const { data: vote } = await supabase
      .from("votes")
      .select("vote_type")
      .eq("user_id", user.id)
      .eq("deal_id", deal.id)
      .eq("is_revoked", false)
      .maybeSingle<{ vote_type: number }>();

    if (vote) userVote = vote.vote_type as 1 | -1;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <DealDetail deal={deal} userVote={userVote} isLoggedIn={!!user} currentUserId={user?.id ?? null} isAdmin={isAdmin} />

      <div className="mt-10 border-t-2 border-foreground pt-8">
        <CommentSection dealId={id} currentUserId={user?.id ?? null} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
