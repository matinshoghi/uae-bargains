import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ModerationDealList } from "@/components/admin/ModerationDealList";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { DealWithRelations } from "@/lib/types";

type ModerationStatusFilter = "all" | "active" | "expired" | "removed";
type ModerationSort = "newest" | "oldest" | "most-upvotes" | "most-comments";

const MODERATION_PAGE_SIZE = 50;

const STATUS_FILTERS: { label: string; value: ModerationStatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Expired", value: "expired" },
  { label: "Removed", value: "removed" },
];

const SORT_OPTIONS: { label: string; value: ModerationSort }[] = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Most Upvotes", value: "most-upvotes" },
  { label: "Most Comments", value: "most-comments" },
];

type SearchParams = Promise<{
  status?: string;
  q?: string;
  category?: string;
  sort?: string;
  page?: string;
}>;

interface QueryState {
  status: ModerationStatusFilter;
  q: string;
  category: string;
  sort: ModerationSort;
  page: number;
}

function parseStatusFilter(value?: string): ModerationStatusFilter {
  if (value === "active" || value === "expired" || value === "removed") {
    return value;
  }
  return "all";
}

function parseSort(value?: string): ModerationSort {
  if (
    value === "oldest" ||
    value === "most-upvotes" ||
    value === "most-comments"
  ) {
    return value;
  }
  return "newest";
}

function parsePage(value?: string): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function toQueryString(state: QueryState): string {
  const params = new URLSearchParams();

  if (state.status !== "all") params.set("status", state.status);
  if (state.q) params.set("q", state.q);
  if (state.category) params.set("category", state.category);
  if (state.sort !== "newest") params.set("sort", state.sort);
  if (state.page > 1) params.set("page", String(state.page));

  return params.toString();
}

function moderationHref(state: QueryState): string {
  const queryString = toQueryString(state);
  return queryString ? `/admin/moderation?${queryString}` : "/admin/moderation";
}

export default async function AdminModerationPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const rawSearchParams = await searchParams;
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const statusFilter = parseStatusFilter(rawSearchParams.status);
  const searchQuery = rawSearchParams.q?.trim() ?? "";
  const sort = parseSort(rawSearchParams.sort);
  const page = parsePage(rawSearchParams.page);

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, label, slug")
    .order("label", { ascending: true });

  if (categoriesError) throw categoriesError;

  const selectedCategory =
    categories?.find((category) => category.slug === rawSearchParams.category) ??
    null;

  let dealsQuery = supabase
    .from("deals")
    .select(
      `*, profiles:user_id (username, avatar_url), categories:category_id (label, slug)`,
      { count: "exact" }
    );

  if (searchQuery) {
    dealsQuery = dealsQuery.ilike("title", `%${searchQuery}%`);
  }

  if (selectedCategory) {
    dealsQuery = dealsQuery.eq("category_id", selectedCategory.id);
  }

  const nowIso = new Date().toISOString();

  if (statusFilter === "active") {
    dealsQuery = dealsQuery.or(
      `and(status.eq.active,expires_at.is.null),and(status.eq.active,expires_at.gte.${nowIso})`
    );
  }

  if (statusFilter === "expired") {
    dealsQuery = dealsQuery.or(
      `status.eq.expired,and(status.eq.active,expires_at.lt.${nowIso})`
    );
  }

  if (statusFilter === "removed") {
    dealsQuery = dealsQuery.eq("status", "removed");
  }

  if (sort === "newest") {
    dealsQuery = dealsQuery.order("created_at", { ascending: false });
  }

  if (sort === "oldest") {
    dealsQuery = dealsQuery.order("created_at", { ascending: true });
  }

  if (sort === "most-upvotes") {
    dealsQuery = dealsQuery
      .order("upvote_count", { ascending: false })
      .order("created_at", { ascending: false });
  }

  if (sort === "most-comments") {
    dealsQuery = dealsQuery
      .order("comment_count", { ascending: false })
      .order("created_at", { ascending: false });
  }

  const from = (page - 1) * MODERATION_PAGE_SIZE;
  const to = from + MODERATION_PAGE_SIZE - 1;

  const { data, error, count } = await dealsQuery.range(from, to);

  if (error) throw error;

  const deals = (data as DealWithRelations[]) ?? [];
  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / MODERATION_PAGE_SIZE));

  if (totalCount > 0 && page > totalPages) {
    redirect(
      moderationHref({
        status: statusFilter,
        q: searchQuery,
        category: selectedCategory?.slug ?? "",
        sort,
        page: totalPages,
      })
    );
  }

  const hasPreviousPage = page > 1;
  const hasNextPage = page * MODERATION_PAGE_SIZE < totalCount;
  const rangeStart = totalCount === 0 ? 0 : from + 1;
  const rangeEnd = Math.min(page * MODERATION_PAGE_SIZE, totalCount);

  const currentQueryState: QueryState = {
    status: statusFilter,
    q: searchQuery,
    category: selectedCategory?.slug ?? "",
    sort,
    page,
  };

  const dealIds = deals.map((deal) => deal.id);

  const { data: pushRows } = dealIds.length
    ? await adminClient
        .from("telegram_pushes")
        .select("deal_id, created_at")
        .in("deal_id", dealIds)
        .order("created_at", { ascending: false })
    : { data: [] as { deal_id: string; created_at: string | null }[] };

  const pushMap =
    pushRows?.reduce<Record<string, string | null>>((acc, row) => {
      if (!acc[row.deal_id]) {
        acc[row.deal_id] = row.created_at;
      }
      return acc;
    }, {}) ?? {};

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Moderation</h1>
      <p className="mt-2 text-muted-foreground">
        Review, remove, restore, and edit deals across the platform.
      </p>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => {
            const isActive = filter.value === statusFilter;
            const href = moderationHref({
              ...currentQueryState,
              status: filter.value,
              page: 1,
            });

            return (
              <Link
                key={filter.value}
                href={href}
                className={buttonVariants({
                  size: "sm",
                  variant: isActive ? "default" : "outline",
                })}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>

        <form
          method="get"
          className="grid gap-3 rounded-xl border border-border p-4 md:grid-cols-2 xl:grid-cols-5"
        >
          <input type="hidden" name="status" value={statusFilter} />

          <div className="xl:col-span-2">
            <label htmlFor="moderation-q" className="mb-1 block text-xs font-medium">
              Search
            </label>
            <Input
              id="moderation-q"
              name="q"
              defaultValue={searchQuery}
              placeholder="Search deals by title"
            />
          </div>

          <div>
            <label
              htmlFor="moderation-category"
              className="mb-1 block text-xs font-medium"
            >
              Category
            </label>
            <select
              id="moderation-category"
              name="category"
              defaultValue={selectedCategory?.slug ?? ""}
              className="border-foreground/20 focus-visible:border-accent-neon focus-visible:ring-accent-neon/30 block h-9 w-full rounded-sm border-2 bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
            >
              <option value="">All categories</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="moderation-sort" className="mb-1 block text-xs font-medium">
              Sort
            </label>
            <select
              id="moderation-sort"
              name="sort"
              defaultValue={sort}
              className="border-foreground/20 focus-visible:border-accent-neon focus-visible:ring-accent-neon/30 block h-9 w-full rounded-sm border-2 bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className={buttonVariants({ size: "sm", variant: "default" })}
            >
              Apply
            </button>
            <Link
              href="/admin/moderation"
              className={buttonVariants({ size: "sm", variant: "outline" })}
            >
              Reset
            </Link>
          </div>
        </form>
      </div>

      <div className="mt-8 space-y-4">
        <p className="text-sm text-muted-foreground">
          Showing {rangeStart}–{rangeEnd} of {totalCount} deals
        </p>

        <ModerationDealList deals={deals} pushMap={pushMap} />

        {(hasPreviousPage || hasNextPage) && (
          <div className="flex items-center justify-between gap-3">
            {hasPreviousPage ? (
              <Link
                href={moderationHref({ ...currentQueryState, page: page - 1 })}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Previous
              </Link>
            ) : (
              <span />
            )}

            <span className="text-xs text-muted-foreground">Page {page}</span>

            {hasNextPage ? (
              <Link
                href={moderationHref({ ...currentQueryState, page: page + 1 })}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Next
              </Link>
            ) : (
              <span />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
