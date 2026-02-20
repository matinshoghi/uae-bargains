import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CategoryBar } from "@/components/layout/CategoryBar";
import { SortBar } from "@/components/layout/SortBar";
import { DealFeed } from "@/components/deals/DealFeed";
import { fetchDeals, getUserDealVotes } from "@/lib/queries/deals";
import { DEALS_PER_PAGE } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
};

async function getCategory(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, label, slug, icon, sort_order")
    .eq("slug", slug)
    .single();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return { title: "Category Not Found" };
  }

  return {
    title: `${category.label} Deals`,
    description: `Browse the best ${category.label.toLowerCase()} deals in the UAE.`,
  };
}

function CategoryBarFallback() {
  return (
    <div className="flex gap-2 px-4 py-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-20 rounded-full" />
      ))}
    </div>
  );
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sort = "hot" } = await searchParams;

  const category = await getCategory(slug);
  if (!category) notFound();

  const [deals, { userVotes, isLoggedIn }] = await Promise.all([
    fetchDeals({
      sort,
      limit: DEALS_PER_PAGE + 1,
      offset: 0,
      categorySlug: slug,
    }),
    getUserDealVotes(),
  ]);

  return (
    <>
      <Suspense fallback={<CategoryBarFallback />}>
        <CategoryBar />
      </Suspense>

      <Suspense>
        <SortBar />
      </Suspense>

      <div className="mx-auto max-w-3xl px-4 py-4">
        <h1 className="mb-4 text-2xl font-bold">{category.label}</h1>
        <DealFeed
          initialDeals={deals}
          sort={sort}
          categorySlug={slug}
          userVotes={userVotes}
          isLoggedIn={isLoggedIn}
        />
      </div>
    </>
  );
}
