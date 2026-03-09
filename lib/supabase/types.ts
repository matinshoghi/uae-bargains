export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          reputation: number;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          reputation?: number;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          reputation?: number;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          label: string;
          slug: string;
          icon: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          label: string;
          slug: string;
          icon?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          label?: string;
          slug?: string;
          icon?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      deals: {
        Row: {
          id: string;
          user_id: string | null;
          category_id: string;
          title: string;
          description: string;
          price: number | null;
          original_price: number | null;
          discount_percentage: number | null;
          url: string | null;
          promo_code: string | null;
          location: string | null;
          image_url: string | null;
          expires_at: string | null;
          upvote_count: number;
          downvote_count: number;
          comment_count: number;
          hot_score: number;
          is_featured: boolean;
          status: "active" | "expired" | "removed";
          removed_by: string | null;
          removal_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          title: string;
          description: string;
          price?: number | null;
          original_price?: number | null;
          url?: string | null;
          promo_code?: string | null;
          location?: string | null;
          image_url?: string | null;
          expires_at?: string | null;
          is_featured?: boolean;
          status?: "active" | "expired" | "removed";
          removed_by?: string | null;
          removal_reason?: string | null;
        };
        Update: {
          user_id?: string | null;
          category_id?: string;
          title?: string;
          description?: string;
          price?: number | null;
          original_price?: number | null;
          url?: string | null;
          promo_code?: string | null;
          location?: string | null;
          image_url?: string | null;
          expires_at?: string | null;
          is_featured?: boolean;
          status?: "active" | "expired" | "removed";
          removed_by?: string | null;
          removal_reason?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "deals_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deals_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      comments: {
        Row: {
          id: string;
          deal_id: string;
          user_id: string | null;
          parent_id: string | null;
          content: string;
          depth: number;
          upvote_count: number;
          downvote_count: number;
          is_hidden: boolean;
          is_edited: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          deal_id: string;
          user_id: string;
          parent_id?: string | null;
          content: string;
          depth?: number;
          is_hidden?: boolean;
          is_edited?: boolean;
        };
        Update: {
          user_id?: string | null;
          content?: string;
          is_hidden?: boolean;
          is_edited?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_deal_id_fkey";
            columns: ["deal_id"];
            isOneToOne: false;
            referencedRelation: "deals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
        ];
      };
      votes: {
        Row: {
          id: string;
          user_id: string;
          deal_id: string | null;
          comment_id: string | null;
          vote_type: number;
          is_revoked: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          deal_id?: string | null;
          comment_id?: string | null;
          vote_type: number;
          is_revoked?: boolean;
        };
        Update: {
          vote_type?: number;
          is_revoked?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "votes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "votes_deal_id_fkey";
            columns: ["deal_id"];
            isOneToOne: false;
            referencedRelation: "deals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "votes_comment_id_fkey";
            columns: ["comment_id"];
            isOneToOne: false;
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
        ];
      };
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          category: string;
          message: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          category: string;
          message: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          status?: string;
        };
        Relationships: [];
      };
      hero_banners: {
        Row: {
          id: string;
          desktop_image_url: string;
          mobile_image_url: string | null;
          link_url: string | null;
          banner_type: "image" | "dynamic";
          title: string | null;
          subtitle: string | null;
          button_text: string | null;
          button_url: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          desktop_image_url: string;
          mobile_image_url?: string | null;
          link_url?: string | null;
          banner_type?: "image" | "dynamic";
          title?: string | null;
          subtitle?: string | null;
          button_text?: string | null;
          button_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          desktop_image_url?: string;
          mobile_image_url?: string | null;
          link_url?: string | null;
          banner_type?: "image" | "dynamic";
          title?: string | null;
          subtitle?: string | null;
          button_text?: string | null;
          button_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      seed_accounts: {
        Row: {
          id: string;
          user_id: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "seed_accounts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      anonymous_votes: {
        Row: {
          id: string;
          anon_id: string;
          deal_id: string;
          vote_type: number;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          anon_id: string;
          deal_id: string;
          vote_type: number;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          vote_type?: number;
        };
        Relationships: [
          {
            foreignKeyName: "anonymous_votes_deal_id_fkey";
            columns: ["deal_id"];
            isOneToOne: false;
            referencedRelation: "deals";
            referencedColumns: ["id"];
          },
        ];
      };
      telegram_pushes: {
        Row: {
          id: string;
          deal_id: string;
          pushed_by: string;
          telegram_message_id: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          deal_id: string;
          pushed_by: string;
          telegram_message_id?: number | null;
          created_at?: string;
        };
        Update: {
          deal_id?: string;
          pushed_by?: string;
          telegram_message_id?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "telegram_pushes_deal_id_fkey";
            columns: ["deal_id"];
            isOneToOne: false;
            referencedRelation: "deals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "telegram_pushes_pushed_by_fkey";
            columns: ["pushed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      stores: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          website_url: string | null;
          affiliate_network: string | null;
          description: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          website_url?: string | null;
          affiliate_network?: string | null;
          description?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          logo_url?: string | null;
          website_url?: string | null;
          affiliate_network?: string | null;
          description?: string | null;
          is_active?: boolean;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      coupons: {
        Row: {
          id: string;
          store_id: string;
          code: string | null;
          title: string;
          description: string | null;
          discount_type: "percentage" | "flat" | "bogo" | "free_shipping" | "other";
          discount_value: string | null;
          min_purchase: string | null;
          url: string | null;
          affiliate_url: string | null;
          expires_at: string | null;
          is_verified: boolean;
          is_featured: boolean;
          click_count: number;
          status: "active" | "expired";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          code?: string | null;
          title: string;
          description?: string | null;
          discount_type: "percentage" | "flat" | "bogo" | "free_shipping" | "other";
          discount_value?: string | null;
          min_purchase?: string | null;
          url?: string | null;
          affiliate_url?: string | null;
          expires_at?: string | null;
          is_verified?: boolean;
          is_featured?: boolean;
          status?: "active" | "expired";
        };
        Update: {
          store_id?: string;
          code?: string | null;
          title?: string;
          description?: string | null;
          discount_type?: "percentage" | "flat" | "bogo" | "free_shipping" | "other";
          discount_value?: string | null;
          min_purchase?: string | null;
          url?: string | null;
          affiliate_url?: string | null;
          expires_at?: string | null;
          is_verified?: boolean;
          is_featured?: boolean;
          status?: "active" | "expired";
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "coupons_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_coupon_click: {
        Args: { coupon_id: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
  };
}
