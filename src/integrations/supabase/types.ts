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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      career_recommendations: {
        Row: {
          career_title: string
          created_at: string
          description: string | null
          id: string
          industry: string | null
          mbti_type: Database["public"]["Enums"]["mbti_type"]
        }
        Insert: {
          career_title: string
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          mbti_type: Database["public"]["Enums"]["mbti_type"]
        }
        Update: {
          career_title?: string
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          mbti_type?: Database["public"]["Enums"]["mbti_type"]
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          course_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          course_restrictions: string[] | null
          created_at: string
          discount_amount: number
          discount_type: string
          id: string
          is_active: boolean
          updated_at: string
          usage_limit: number | null
          used_count: number
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          code: string
          course_restrictions?: string[] | null
          created_at?: string
          discount_amount: number
          discount_type?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          code?: string
          course_restrictions?: string[] | null
          created_at?: string
          discount_amount?: number
          discount_type?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      course_contents: {
        Row: {
          content_url: string | null
          created_at: string
          description: string | null
          id: string
          order_index: number
          section_id: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          content_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          section_id: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          content_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          section_id?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_contents_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "course_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      course_recommendations: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          mbti_type: Database["public"]["Enums"]["mbti_type"]
          skill_title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          mbti_type: Database["public"]["Enums"]["mbti_type"]
          skill_title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          mbti_type?: Database["public"]["Enums"]["mbti_type"]
          skill_title?: string
        }
        Relationships: []
      }
      course_sections: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_sections_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          age_range: string | null
          category: string | null
          created_at: string | null
          description: string | null
          duration: string | null
          id: string
          image_url: string | null
          instructor_id: string | null
          mode: string | null
          original_price: number | null
          price: number
          status: Database["public"]["Enums"]["course_status"] | null
          title: string
          total_lessons: number | null
          updated_at: string | null
        }
        Insert: {
          age_range?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          image_url?: string | null
          instructor_id?: string | null
          mode?: string | null
          original_price?: number | null
          price: number
          status?: Database["public"]["Enums"]["course_status"] | null
          title: string
          total_lessons?: number | null
          updated_at?: string | null
        }
        Update: {
          age_range?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          image_url?: string | null
          instructor_id?: string | null
          mode?: string | null
          original_price?: number | null
          price?: number
          status?: Database["public"]["Enums"]["course_status"] | null
          title?: string
          total_lessons?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          completed_at: string | null
          completed_lessons: number | null
          course_id: string | null
          enrolled_at: string | null
          id: string
          next_class_at: string | null
          progress: number | null
          status: Database["public"]["Enums"]["enrollment_status"] | null
          student_id: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_lessons?: number | null
          course_id?: string | null
          enrolled_at?: string | null
          id?: string
          next_class_at?: string | null
          progress?: number | null
          status?: Database["public"]["Enums"]["enrollment_status"] | null
          student_id?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_lessons?: number | null
          course_id?: string | null
          enrolled_at?: string | null
          id?: string
          next_class_at?: string | null
          progress?: number | null
          status?: Database["public"]["Enums"]["enrollment_status"] | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_content: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          link_url: string | null
          order_index: number
          section_name: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          order_index?: number
          section_name: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          order_index?: number
          section_name?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      mbti_results: {
        Row: {
          completed_at: string
          created_at: string
          extraversion_score: number
          id: string
          judging_score: number
          mbti_type: Database["public"]["Enums"]["mbti_type"]
          sensing_score: number
          thinking_score: number
          total_questions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          extraversion_score?: number
          id?: string
          judging_score?: number
          mbti_type: Database["public"]["Enums"]["mbti_type"]
          sensing_score?: number
          thinking_score?: number
          total_questions?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          extraversion_score?: number
          id?: string
          judging_score?: number
          mbti_type?: Database["public"]["Enums"]["mbti_type"]
          sensing_score?: number
          thinking_score?: number
          total_questions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          order_id: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          order_id?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          order_id?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          course_id: string
          created_at: string
          id: string
          order_id: string
          price: number
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          order_id: string
          price: number
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          order_id?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          id: string
          payment_method: string | null
          payment_screenshot_url: string | null
          status: string
          total_amount: number
          updated_at: string
          upi_app: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          payment_method?: string | null
          payment_screenshot_url?: string | null
          status?: string
          total_amount: number
          updated_at?: string
          upi_app?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          payment_method?: string | null
          payment_screenshot_url?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          upi_app?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          course_id: string | null
          created_at: string | null
          currency: string | null
          enrollment_id: string | null
          id: string
          payment_gateway: string | null
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          student_id: string | null
          updated_at: string | null
          upi_transaction_id: string | null
        }
        Insert: {
          amount: number
          course_id?: string | null
          created_at?: string | null
          currency?: string | null
          enrollment_id?: string | null
          id?: string
          payment_gateway?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          student_id?: string | null
          updated_at?: string | null
          upi_transaction_id?: string | null
        }
        Update: {
          amount?: number
          course_id?: string | null
          created_at?: string | null
          currency?: string | null
          enrollment_id?: string | null
          id?: string
          payment_gateway?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          student_id?: string | null
          updated_at?: string | null
          upi_transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          mbti_quiz_completed: boolean | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          show_mbti_reminder: boolean | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          mbti_quiz_completed?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          show_mbti_reminder?: boolean | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          mbti_quiz_completed?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          show_mbti_reminder?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          created_at: string
          description: string | null
          file_size: number | null
          file_type: string
          google_drive_embed_url: string
          google_drive_file_id: string
          google_drive_public_url: string
          id: string
          original_filename: string
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type: string
          google_drive_embed_url: string
          google_drive_file_id: string
          google_drive_public_url: string
          id?: string
          original_filename: string
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string
          google_drive_embed_url?: string
          google_drive_file_id?: string
          google_drive_public_url?: string
          id?: string
          original_filename?: string
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      validate_file_url: {
        Args: { url: string }
        Returns: boolean
      }
    }
    Enums: {
      course_status: "active" | "inactive" | "archived"
      enrollment_status: "enrolled" | "completed" | "dropped" | "pending"
      mbti_type:
        | "INTJ"
        | "INTP"
        | "ENTJ"
        | "ENTP"
        | "INFJ"
        | "INFP"
        | "ENFJ"
        | "ENFP"
        | "ISTJ"
        | "ISFJ"
        | "ESTJ"
        | "ESFJ"
        | "ISTP"
        | "ISFP"
        | "ESTP"
        | "ESFP"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      user_role: "student" | "admin" | "instructor"
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
    Enums: {
      course_status: ["active", "inactive", "archived"],
      enrollment_status: ["enrolled", "completed", "dropped", "pending"],
      mbti_type: [
        "INTJ",
        "INTP",
        "ENTJ",
        "ENTP",
        "INFJ",
        "INFP",
        "ENFJ",
        "ENFP",
        "ISTJ",
        "ISFJ",
        "ESTJ",
        "ESFJ",
        "ISTP",
        "ISFP",
        "ESTP",
        "ESFP",
      ],
      payment_status: ["pending", "completed", "failed", "refunded"],
      user_role: ["student", "admin", "instructor"],
    },
  },
} as const
