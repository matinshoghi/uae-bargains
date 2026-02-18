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

  if (!deal) {
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
      .maybeSingle();

    if (vote) userVote = vote.vote_type as 1 | -1;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <DealDetail deal={deal} userVote={userVote} isLoggedIn={!!user} />

      <div className="mt-8 border-t border-zinc-100 pt-6">
        <CommentSection dealId={id} isLoggedIn={!!user} />
      </div>
    </div>
  );
}
