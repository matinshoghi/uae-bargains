import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { DealForm } from "@/components/deals/DealForm";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Edit Deal",
};

export default async function EditDealPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch deal
  const { data: deal } = await supabase
    .from("deals")
    .select("id, user_id, title, description, price, original_price, url, location, category_id, expires_at, image_url, status")
    .eq("id", id)
    .single();

  if (!deal) {
    notFound();
  }

  // Check ownership
  if (deal.user_id !== user.id) {
    redirect(`/deals/${id}`);
  }

  // Don't allow editing removed deals
  if (deal.status === "removed") {
    redirect("/");
  }

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("id, label, slug")
    .order("sort_order");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Edit Deal</h1>
      <DealForm
        categories={categories ?? []}
        initialData={{
          id: deal.id,
          title: deal.title,
          description: deal.description,
          price: deal.price,
          original_price: deal.original_price,
          url: deal.url,
          location: deal.location,
          category_id: deal.category_id,
          expires_at: deal.expires_at,
          image_url: deal.image_url,
        }}
      />
    </div>
  );
}
