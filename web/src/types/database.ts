export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: string;
          slug: string;
          title: string;
          tagline: string | null;
          description: string | null;
          long_description: string | null;
          cover_image_url: string | null;
          price_inr: number;
          price_usd: number;
          genre: string | null;
          word_count: number | null;
          scene_list: string[];
          free_scene_list: string[];
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          tagline?: string | null;
          description?: string | null;
          long_description?: string | null;
          cover_image_url?: string | null;
          price_inr?: number;
          price_usd?: number;
          genre?: string | null;
          word_count?: number | null;
          scene_list?: string[];
          free_scene_list?: string[];
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["games"]["Insert"]>;
      };
      purchases: {
        Row: {
          id: string;
          user_id: string;
          game_id: string;
          razorpay_payment_id: string | null;
          razorpay_order_id: string | null;
          amount_paise: number;
          currency: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_id: string;
          razorpay_payment_id?: string | null;
          razorpay_order_id?: string | null;
          amount_paise?: number;
          currency?: string;
          status?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["purchases"]["Insert"]>;
      };
      save_data: {
        Row: {
          id: string;
          user_id: string;
          game_id: string;
          slot_name: string;
          current_scene: string;
          variables: Record<string, unknown>;
          choice_history: Array<{ scene: string; choice: string }>;
          saved_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_id: string;
          slot_name?: string;
          current_scene: string;
          variables?: Record<string, unknown>;
          choice_history?: Array<{ scene: string; choice: string }>;
          saved_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["save_data"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Game = Database["public"]["Tables"]["games"]["Row"];
export type Purchase = Database["public"]["Tables"]["purchases"]["Row"];
export type SaveData = Database["public"]["Tables"]["save_data"]["Row"];
