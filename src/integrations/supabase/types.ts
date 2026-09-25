export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean
          position: number
          short_description: string
          slug: string
          title: string
        }
        Insert: {
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          position?: number
          short_description: string
          slug: string
          title: string
        }
        Update: {
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          position?: number
          short_description?: string
          slug?: string
          title?: string
        }
        Relationships: []
      }
      ai_conversation_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          assigned_to: string | null
          id: string
          intent: string | null
          last_message_at: string
          metadata: Json
          session_key: string
          started_at: string
          status: string
          summary: string | null
          visitor_id: string
        }
        Insert: {
          assigned_to?: string | null
          id?: string
          intent?: string | null
          last_message_at?: string
          metadata?: Json
          session_key: string
          started_at?: string
          status?: string
          summary?: string | null
          visitor_id: string
        }
        Update: {
          assigned_to?: string | null
          id?: string
          intent?: string | null
          last_message_at?: string
          metadata?: Json
          session_key?: string
          started_at?: string
          status?: string
          summary?: string | null
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "ai_visitors"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_knowledge: {
        Row: {
          answer: string
          created_at: string
          id: string
          is_active: boolean
          position: number
          question: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          is_active?: boolean
          position?: number
          question: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          is_active?: boolean
          position?: number
          question?: string
        }
        Relationships: []
      }
      ai_visitors: {
        Row: {
          budget_range: string | null
          city: string | null
          company: string | null
          consent_contact: boolean
          country: string | null
          desired_date: string | null
          email: string | null
          first_seen_at: string
          full_name: string | null
          id: string
          last_seen_at: string
          metadata: Json
          notes: string | null
          phone: string | null
          project_type: string | null
          request_type: string | null
          source: string | null
          status: string
          visitor_key: string
        }
        Insert: {
          budget_range?: string | null
          city?: string | null
          company?: string | null
          consent_contact?: boolean
          country?: string | null
          desired_date?: string | null
          email?: string | null
          first_seen_at?: string
          full_name?: string | null
          id?: string
          last_seen_at?: string
          metadata?: Json
          notes?: string | null
          phone?: string | null
          project_type?: string | null
          request_type?: string | null
          source?: string | null
          status?: string
          visitor_key: string
        }
        Update: {
          budget_range?: string | null
          city?: string | null
          company?: string | null
          consent_contact?: boolean
          country?: string | null
          desired_date?: string | null
          email?: string | null
          first_seen_at?: string
          full_name?: string | null
          id?: string
          last_seen_at?: string
          metadata?: Json
          notes?: string | null
          phone?: string | null
          project_type?: string | null
          request_type?: string | null
          source?: string | null
          status?: string
          visitor_key?: string
        }
        Relationships: []
      }
      company_info: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          description: string | null
          email: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          latitude: number | null
          linkedin_url: string | null
          logo_jpg_url: string | null
          logo_png_url: string | null
          logo_url: string | null
          longitude: number | null
          name: string
          opening_hours: string | null
          phone_primary: string | null
          phone_secondary: string | null
          slogan: string
          updated_at: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          latitude?: number | null
          linkedin_url?: string | null
          logo_jpg_url?: string | null
          logo_png_url?: string | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          opening_hours?: string | null
          phone_primary?: string | null
          phone_secondary?: string | null
          slogan?: string
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          latitude?: number | null
          linkedin_url?: string | null
          logo_jpg_url?: string | null
          logo_png_url?: string | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          opening_hours?: string | null
          phone_primary?: string | null
          phone_secondary?: string | null
          slogan?: string
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          cta_label: string | null
          cta_url: string | null
          duration_ms: number
          id: string
          image_url: string
          is_active: boolean
          position: number
          subtitle: string | null
          title: string | null
        }
        Insert: {
          cta_label?: string | null
          cta_url?: string | null
          duration_ms?: number
          id?: string
          image_url: string
          is_active?: boolean
          position?: number
          subtitle?: string | null
          title?: string | null
        }
        Update: {
          cta_label?: string | null
          cta_url?: string | null
          duration_ms?: number
          id?: string
          image_url?: string
          is_active?: boolean
          position?: number
          subtitle?: string | null
          title?: string | null
        }
        Relationships: []
      }
      intro_videos: {
        Row: {
          created_at: string
          cta_label: string | null
          cta_url: string | null
          description: string | null
          id: string
          is_active: boolean
          label: string
          placement: string
          position: number
          title: string | null
          video_url: string
        }
        Insert: {
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          label: string
          placement?: string
          position?: number
          title?: string | null
          video_url: string
        }
        Update: {
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          label?: string
          placement?: string
          position?: number
          title?: string | null
          video_url?: string
        }
        Relationships: []
      }
      media_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          kind: string
          position: number
          poster_url: string | null
          title: string | null
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          kind?: string
          position?: number
          poster_url?: string | null
          title?: string | null
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          kind?: string
          position?: number
          poster_url?: string | null
          title?: string | null
          url?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          admin_reply: string | null
          budget_range: string | null
          company: string | null
          created_at: string
          desired_date: string | null
          email: string
          full_name: string
          id: string
          message: string
          phone: string | null
          project_type: string | null
          replied_at: string | null
          request_type: string
          status: string
          subject: string | null
        }
        Insert: {
          admin_reply?: string | null
          budget_range?: string | null
          company?: string | null
          created_at?: string
          desired_date?: string | null
          email: string
          full_name: string
          id?: string
          message: string
          phone?: string | null
          project_type?: string | null
          replied_at?: string | null
          request_type: string
          status?: string
          subject?: string | null
        }
        Update: {
          admin_reply?: string | null
          budget_range?: string | null
          company?: string | null
          created_at?: string
          desired_date?: string | null
          email?: string
          full_name?: string
          id?: string
          message?: string
          phone?: string | null
          project_type?: string | null
          replied_at?: string | null
          request_type?: string
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      news: {
        Row: {
          author: string | null
          content: string | null
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          image_url: string | null
          is_published: boolean
          published_at: string | null
          slug: string
          title: string
          video_poster_url: string | null
          video_url: string | null
          view_count: number
        }
        Insert: {
          author?: string | null
          content?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string | null
          slug: string
          title: string
          video_poster_url?: string | null
          video_url?: string | null
          view_count?: number
        }
        Update: {
          author?: string | null
          content?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          video_poster_url?: string | null
          video_url?: string | null
          view_count?: number
        }
        Relationships: []
      }
      newsletter_deliveries: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          news_id: string
          sent_at: string | null
          status: string
          subscriber_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          news_id: string
          sent_at?: string | null
          status?: string
          subscriber_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          news_id?: string
          sent_at?: string | null
          status?: string
          subscriber_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_deliveries_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "newsletter_deliveries_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "newsletter_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string
          source: string
          status: string
          updated_at: string
          welcome_sent_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone: string
          source?: string
          status?: string
          updated_at?: string
          welcome_sent_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string
          source?: string
          status?: string
          updated_at?: string
          welcome_sent_at?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          position: number
          website_url: string | null
        }
        Insert: {
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          position?: number
          website_url?: string | null
        }
        Update: {
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          position?: number
          website_url?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          category: string | null
          content: string | null
          cover_image_url: string | null
          created_at: string
          id: string
          image_url: string | null
          is_featured: boolean
          is_published: boolean
          location: string | null
          position: number
          slug: string
          status: string
          summary: string | null
          title: string
        }
        Insert: {
          category?: string | null
          content?: string | null
          cover_image_url?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_published?: boolean
          location?: string | null
          position?: number
          slug: string
          status?: string
          summary?: string | null
          title: string
        }
        Update: {
          category?: string | null
          content?: string | null
          cover_image_url?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_published?: boolean
          location?: string | null
          position?: number
          slug?: string
          status?: string
          summary?: string | null
          title?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author_name: string
          author_role: string | null
          company: string | null
          created_at: string
          id: string
          is_published: boolean
          message: string
          rating: number | null
          status: string
        }
        Insert: {
          author_name: string
          author_role?: string | null
          company?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          message: string
          rating?: number | null
          status?: string
        }
        Update: {
          author_name?: string
          author_role?: string | null
          company?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          message?: string
          rating?: number | null
          status?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "super_admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "super_admin"],
    },
  },
} as const
