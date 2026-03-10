import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { DealForm } from "@/components/deals/DealForm";
import type { Metadata } from "next";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Props = {
  params: Promise<{ slug: string }>;
};

export const metadata: Metadata = {
  title: "Edit Deal",
};

export default async function EditDealPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  // Backwards compatibility: UUID → redirect to slug edit URL
  if (UUID_RE.test(slug)) {
    const { data: deal } = await supabase
      .from("deals")
      .select("slug")
      .eq("id", slug)
      .single();
    if (!deal) notFound();
    redirect(`/deals/${deal.slug}/edit`);
  }

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch deal by slug
  const { data: deal } = await supabase
    .from("deals")
    .select("id, user_id, title, slug, description, price, original_price, url, promo_code, location, category_id, expires_at, image_url, status")
    .eq("slug", slug)
    .single();

  if (!deal) {
    notFound();
  }

  // Check ownership
  if (deal.user_id !== user.id) {
    redirect(`/deals/${deal.slug}`);
  }

  // Don't allow editing removed deals
  if (deal.status === "removed") {
    redirect("/");
  }

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("id, label, slug")
    .order("label");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 font-heading text-[22px] font-black tracking-tight sm:text-2xl">Edit Deal</h1>
      <DealForm
        categories={categories ?? []}
        initialData={{
          id: deal.id,
          title: deal.title,
          description: deal.description,
          price: deal.price,
          original_price: deal.original_price,
          url: deal.url,
          promo_code: deal.promo_code,
          location: deal.location,
          category_id: deal.category_id,
          expires_at: deal.expires_at,
          image_url: deal.image_url,
        }}
      />
    </div>
  );
}
