import type { Database } from "@/lib/supabase/types";

type DealRow = Database["public"]["Tables"]["deals"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type CommentRow = Database["public"]["Tables"]["comments"]["Row"];

export type DealWithRelations = DealRow & {
  profiles: Pick<ProfileRow, "username" | "display_name" | "avatar_url"> | null;
  categories: Pick<CategoryRow, "label" | "slug"> | null;
};

export type CommentWithProfile = CommentRow & {
  profiles: Pick<ProfileRow, "username" | "display_name" | "avatar_url"> | null;
};

export type CommentWithChildren = CommentWithProfile & {
  children: CommentWithChildren[];
};
