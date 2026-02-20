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
          display_name: string | null;
          avatar_url: string | null;
          reputation: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          reputation?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          reputation?: number;
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
          user_id: string;
          category_id: string;
          title: string;
          description: string;
          price: number | null;
          original_price: number | null;
          discount_percentage: number | null;
          url: string | null;
          location: string | null;
          image_url: string | null;
          expires_at: string | null;
          upvote_count: number;
          downvote_count: number;
          comment_count: number;
          hot_score: number;
          status: "active" | "expired" | "removed";
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
          location?: string | null;
          image_url?: string | null;
          expires_at?: string | null;
          status?: "active" | "expired" | "removed";
        };
        Update: {
          category_id?: string;
          title?: string;
          description?: string;
          price?: number | null;
          original_price?: number | null;
          url?: string | null;
          location?: string | null;
          image_url?: string | null;
          expires_at?: string | null;
          status?: "active" | "expired" | "removed";
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
          user_id: string;
          parent_id: string | null;
          content: string;
          depth: number;
          upvote_count: number;
          downvote_count: number;
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
        };
        Update: {
          content?: string;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
