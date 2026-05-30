export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          currency: string;
          monthly_income: number | null;
          financial_goal: string | null;
          lifestyle_level: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          currency?: string;
          monthly_income?: number | null;
          financial_goal?: string | null;
          lifestyle_level?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          currency?: string;
          monthly_income?: number | null;
          financial_goal?: string | null;
          lifestyle_level?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      accounts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: AccountType;
          currency: string;
          balance: number;
          color: string | null;
          icon: string | null;
          is_active: boolean;
          include_in_net_worth: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: AccountType;
          currency?: string;
          balance?: number;
          color?: string | null;
          icon?: string | null;
          is_active?: boolean;
          include_in_net_worth?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          type?: AccountType;
          currency?: string;
          balance?: number;
          color?: string | null;
          icon?: string | null;
          is_active?: boolean;
          include_in_net_worth?: boolean;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: CategoryType;
          icon: string | null;
          color: string | null;
          parent_id: string | null;
          is_system: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: CategoryType;
          icon?: string | null;
          color?: string | null;
          parent_id?: string | null;
          is_system?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          type?: CategoryType;
          icon?: string | null;
          color?: string | null;
          parent_id?: string | null;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          account_id: string;
          category_id: string | null;
          type: TransactionType;
          amount: number;
          description: string;
          notes: string | null;
          date: string;
          is_recurring: boolean;
          recurring_rule: Json | null;
          tags: string[] | null;
          attachment_url: string | null;
          is_confirmed: boolean;
          transfer_pair_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_id: string;
          category_id?: string | null;
          type: TransactionType;
          amount: number;
          description: string;
          notes?: string | null;
          date: string;
          is_recurring?: boolean;
          recurring_rule?: Json | null;
          tags?: string[] | null;
          attachment_url?: string | null;
          is_confirmed?: boolean;
          transfer_pair_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          account_id?: string;
          category_id?: string | null;
          type?: TransactionType;
          amount?: number;
          description?: string;
          notes?: string | null;
          date?: string;
          is_recurring?: boolean;
          recurring_rule?: Json | null;
          tags?: string[] | null;
          attachment_url?: string | null;
          is_confirmed?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      financial_goals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          target_amount: number;
          current_amount: number;
          target_date: string | null;
          category: string | null;
          icon: string | null;
          color: string | null;
          is_completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          target_amount: number;
          current_amount?: number;
          target_date?: string | null;
          category?: string | null;
          icon?: string | null;
          color?: string | null;
          is_completed?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          target_amount?: number;
          current_amount?: number;
          target_date?: string | null;
          category?: string | null;
          icon?: string | null;
          color?: string | null;
          is_completed?: boolean;
        };
        Relationships: [];
      };
      ai_insights: {
        Row: {
          id: string;
          user_id: string;
          type: InsightType;
          period: string | null;
          content: Json;
          generated_at: string;
          expires_at: string | null;
          token_count: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: InsightType;
          period?: string | null;
          content: Json;
          generated_at?: string;
          expires_at?: string | null;
          token_count?: number | null;
        };
        Update: {
          content?: Json;
          expires_at?: string | null;
          token_count?: number | null;
        };
        Relationships: [];
      };
      ai_conversations: {
        Row: {
          id: string;
          user_id: string;
          messages: Json[];
          context_snapshot: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          messages?: Json[];
          context_snapshot?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          messages?: Json[];
          context_snapshot?: Json | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

export type AccountType =
  | "checking"
  | "savings"
  | "investment"
  | "credit"
  | "cash"
  | "wallet";

export type CategoryType = "income" | "expense";

export type TransactionType = "income" | "expense" | "transfer";

export type InsightType =
  | "monthly_report"
  | "pain_points"
  | "suggestions"
  | "health_score"
  | "chat";

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Inserts<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type Updates<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Profile = Tables<"profiles">;
export type Account = Tables<"accounts">;
export type Category = Tables<"categories">;
export type Transaction = Tables<"transactions">;
export type FinancialGoal = Tables<"financial_goals">;
export type AIInsight = Tables<"ai_insights">;
export type AIConversation = Tables<"ai_conversations">;
