import { createClient } from "@/lib/supabase/server";
import { CategoryBarClient } from "./CategoryBarClient";
import type { Database } from "@/lib/supabase/types";

type Category = Database["public"]["Tables"]["categories"]["Row"];

export async function CategoryBar() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select()
    .order("sort_order")
    .returns<Category[]>();

  return <CategoryBarClient categories={categories ?? []} />;
}
