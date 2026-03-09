import type { Database } from "@/lib/supabase/types";

type DealRow = Database["public"]["Tables"]["deals"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type CommentRow = Database["public"]["Tables"]["comments"]["Row"];

export type StoreRow = Database["public"]["Tables"]["stores"]["Row"];
export type CouponRow = Database["public"]["Tables"]["coupons"]["Row"];

export type StoreWithCouponCount = StoreRow & { coupon_count: number };
export type CouponWithStore = CouponRow & {
  stores: Pick<StoreRow, "name" | "slug" | "logo_url"> | null;
};

export type DealWithRelations = DealRow & {
  profiles: Pick<ProfileRow, "username" | "avatar_url"> | null;
  categories: Pick<CategoryRow, "label" | "slug"> | null;
};

export type AdminComment = CommentRow & {
  profiles: Pick<ProfileRow, "username" | "avatar_url"> | null;
  deals: Pick<DealRow, "title"> | null;
};

export type CommentWithProfile = CommentRow & {
  profiles: Pick<ProfileRow, "username" | "avatar_url"> | null;
};

export type CommentWithChildren = CommentWithProfile & {
  children: CommentWithChildren[];
};
