export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          alert_type: string
          brand_id: string
          created_at: string
          id: string
          is_sent: boolean | null
          message: string
          sent_at: string | null
          sentiment_threshold: number | null
        }
        Insert: {
          alert_type: string
          brand_id: string
          created_at?: string
          id?: string
          is_sent?: boolean | null
          message: string
          sent_at?: string | null
          sentiment_threshold?: number | null
        }
        Update: {
          alert_type?: string
          brand_id?: string
          created_at?: string
          id?: string
          is_sent?: boolean | null
          message?: string
          sent_at?: string | null
          sentiment_threshold?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_mentions: {
        Row: {
          author_username: string | null
          brand_id: string
          confidence: number
          created_at: string
          id: string
          mention_date: string
          mention_text: string
          platform: string
          platform_id: string | null
          sentiment_label: string
          sentiment_score: number
          url: string | null
        }
        Insert: {
          author_username?: string | null
          brand_id: string
          confidence: number
          created_at?: string
          id?: string
          mention_date?: string
          mention_text: string
          platform?: string
          platform_id?: string | null
          sentiment_label: string
          sentiment_score: number
          url?: string | null
        }
        Update: {
          author_username?: string | null
          brand_id?: string
          confidence?: number
          created_at?: string
          id?: string
          mention_date?: string
          mention_text?: string
          platform?: string
          platform_id?: string | null
          sentiment_label?: string
          sentiment_score?: number
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_mentions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_topics: {
        Row: {
          brand_id: string
          created_at: string
          id: string
          mention_count: number | null
          sentiment_avg: number | null
          topic: string
          updated_at: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          id?: string
          mention_count?: number | null
          sentiment_avg?: number | null
          topic: string
          updated_at?: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          id?: string
          mention_count?: number | null
          sentiment_avg?: number | null
          topic?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_topics_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          notification_email: string | null
          telegram_chat_id: string | null
          twitter_handle: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          notification_email?: string | null
          telegram_chat_id?: string | null
          twitter_handle?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          notification_email?: string | null
          telegram_chat_id?: string | null
          twitter_handle?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sentiment_data: {
        Row: {
          analysis_date: string
          brand_id: string
          confidence: number
          created_at: string
          id: string
          negative_mentions: number | null
          neutral_mentions: number | null
          positive_mentions: number | null
          sentiment_label: string
          sentiment_score: number
          total_mentions: number | null
        }
        Insert: {
          analysis_date?: string
          brand_id: string
          confidence: number
          created_at?: string
          id?: string
          negative_mentions?: number | null
          neutral_mentions?: number | null
          positive_mentions?: number | null
          sentiment_label: string
          sentiment_score: number
          total_mentions?: number | null
        }
        Update: {
          analysis_date?: string
          brand_id?: string
          confidence?: number
          created_at?: string
          id?: string
          negative_mentions?: number | null
          neutral_mentions?: number | null
          positive_mentions?: number | null
          sentiment_label?: string
          sentiment_score?: number
          total_mentions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sentiment_data_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
