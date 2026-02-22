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

  // Show a simple notice for removed deals (like Reddit's [deleted])
  if (deal.status === "removed") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-sm border-[1.5px] border-dashed border-foreground/15 p-8 text-center text-muted-foreground">
          <p className="text-lg font-medium">This deal has been removed</p>
          <p className="mt-1 text-sm">The author deleted this deal.</p>
        </div>
      </div>
    );
  }

  // Fetch current user's vote for this deal
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
      <DealDetail deal={deal} userVote={userVote} isLoggedIn={!!user} currentUserId={user?.id ?? null} />

      <div className="mt-8 border-t border-foreground/10 pt-6">
        <CommentSection dealId={id} currentUserId={user?.id ?? null} />
      </div>
    </div>
  );
}
