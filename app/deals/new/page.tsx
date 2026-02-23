import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DealForm } from "@/components/deals/DealForm";
import { PostingRulesSidebar } from "@/components/deals/PostingRulesSidebar";

export const metadata = {
  title: "Post a Deal — HalaSaves",
  description: "Share a deal you've found with the HalaSaves community.",
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
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Mobile: rules above form */}
      <div className="mb-6 lg:hidden">
        <PostingRulesSidebar />
      </div>

      <div className="flex gap-8">
        {/* Form column */}
        <div className="min-w-0 flex-1">
          <h1 className="mb-6 text-2xl font-bold">Post a Deal</h1>
          <DealForm categories={categories ?? []} />
        </div>

        {/* Rules sidebar — desktop only */}
        <aside className="hidden w-[300px] shrink-0 lg:block">
          <PostingRulesSidebar />
        </aside>
      </div>
    </div>
  );
}
