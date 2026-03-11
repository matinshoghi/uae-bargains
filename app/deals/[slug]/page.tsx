import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { DealDetail } from "@/components/deals/DealDetail";
import { DealAwarenessBar } from "@/components/deals/DealAwarenessBar";
import { DealDetailSidebar } from "@/components/deals/DealDetailSidebar";
import { DealNewHereSection } from "@/components/deals/DealNewHereSection";
import { CommentSection } from "@/components/comments/CommentSection";
import type { Metadata } from "next";
import type { DealWithRelations } from "@/lib/types";
import { DealJsonLd } from "@/components/seo/DealJsonLd";
import { buildDealMetaDescription } from "@/lib/seo";
import { getPlatformStats } from "@/lib/queries/platform-stats";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Props = {
  params: Promise<{ slug: string }>;
};

async function getDealBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("deals")
    .select(
      `
      *,
      profiles:user_id (username, avatar_url),
      categories:category_id (label, slug)
    `
    )
    .eq("slug", slug)
    .single();

  return data as DealWithRelations | null;
}

async function getDealById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("deals")
    .select("slug")
    .eq("id", id)
    .single();

  return data as { slug: string } | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // If UUID, don't generate metadata — the redirect will handle it
  if (UUID_RE.test(slug)) {
    return { title: "Redirecting..." };
  }

  const deal = await getDealBySlug(slug);

  if (!deal) {
    return { title: "Deal Not Found" };
  }

  if (deal.status === "removed") {
    return { title: "Deal Not Found", robots: { index: false, follow: false } };
  }

  const description = buildDealMetaDescription(deal);
  const canonicalUrl = `https://halasaves.com/deals/${deal.slug}`;

  const images = deal.image_url ? [{ url: deal.image_url }] : [];

  return {
    title: deal.title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: deal.title,
      description,
      url: canonicalUrl,
      type: "article",
      ...(images.length > 0 && { images }),
    },
    twitter: {
      card: images.length > 0 ? "summary_large_image" : "summary",
      title: deal.title,
      description,
      ...(images.length > 0 && { images }),
    },
  };
}

export default async function DealPage({ params }: Props) {
  const { slug } = await params;

  // Backwards compatibility: if param is a UUID, redirect to the slug URL
  if (UUID_RE.test(slug)) {
    const deal = await getDealById(slug);
    if (!deal) notFound();
    redirect(`/deals/${deal.slug}`);
  }

  const deal = await getDealBySlug(slug);

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

  const platformStats = await getPlatformStats();

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
  } else {
    // Check for anonymous vote
    const { getAnonymousVotes } = await import("@/lib/actions/votes");
    const anonVotes = await getAnonymousVotes();
    if (anonVotes[deal.id]) userVote = anonVotes[deal.id] as 1 | -1;
  }

  return (
    <>
      {!user && <DealAwarenessBar stats={platformStats} />}

      <div className="mx-auto max-w-[1100px] px-4 py-8">
        <DealJsonLd deal={deal} />

        <div className="flex gap-8">
          {/* Main content */}
          <div className="min-w-0 flex-1">
            <DealDetail
              deal={deal}
              currentUserId={user?.id ?? null}
              isAdmin={isAdmin}
            />

            {/* Mobile sidebar — shown below content on small screens */}
            <div className="mt-6 lg:hidden">
              <DealDetailSidebar
                deal={deal}
                userVote={userVote}
                isLoggedIn={!!user}
                platformStats={platformStats}
              />
            </div>

            {!user && <DealNewHereSection />}

            <div className="mt-10 border-t border-[#e4e3dd] pt-8">
              <CommentSection
                dealId={deal.id}
                currentUserId={user?.id ?? null}
                isAdmin={isAdmin}
              />
            </div>
          </div>

          {/* Desktop sidebar */}
          <aside className="hidden w-[320px] shrink-0 lg:block">
            <div className="sticky top-[68px]">
              <DealDetailSidebar
                deal={deal}
                userVote={userVote}
                isLoggedIn={!!user}
                platformStats={platformStats}
              />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
