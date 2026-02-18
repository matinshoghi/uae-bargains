import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DealForm } from "@/components/deals/DealForm";

export const metadata = {
  title: "Post a Deal — UAE Bargains",
  description: "Share a deal you've found with the UAE Bargains community.",
};

export default async function NewDealPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: categories } = await supabase
    .from("categories")
    .select()
    .order("sort_order")
    .returns<{ id: string; label: string; slug: string }[]>();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Post a Deal</h1>
      <DealForm categories={categories ?? []} />
    </div>
  );
}
