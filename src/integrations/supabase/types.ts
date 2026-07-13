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
      application_files: {
        Row: {
          application_id: string
          created_at: string
          file_kind: string
          file_name: string | null
          id: string
          public_url: string | null
          size_bytes: number | null
          storage_path: string
        }
        Insert: {
          application_id: string
          created_at?: string
          file_kind: string
          file_name?: string | null
          id?: string
          public_url?: string | null
          size_bytes?: number | null
          storage_path: string
        }
        Update: {
          application_id?: string
          created_at?: string
          file_kind?: string
          file_name?: string | null
          id?: string
          public_url?: string | null
          size_bytes?: number | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_files_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          academic_session: string | null
          admission_number: string | null
          admission_type: string | null
          alt_phone_number: string | null
          applying_for_grade: string | null
          bece_result: string | null
          certification_agreed: boolean
          common_entrance_score: string | null
          country: string | null
          created_at: string
          current_class: string | null
          current_school: string | null
          date_of_birth: string | null
          email: string | null
          emergency_contact: string | null
          emergency_number: string | null
          employer: string | null
          father_name: string | null
          gender: string | null
          guardian_name: string | null
          guardian_relationship: string | null
          id: string
          local_government: string | null
          mother_name: string | null
          nationality: string | null
          neco_result: string | null
          occupation: string | null
          phone_number: string | null
          photo_url: string | null
          previous_class: string | null
          previous_schools: string | null
          religion: string | null
          residential_address: string | null
          state: string | null
          state_of_origin: string | null
          status: Database["public"]["Enums"]["application_status"]
          student_first_name: string | null
          student_last_name: string | null
          student_middle_name: string | null
          submitted_at: string | null
          updated_at: string
          waec_result: string | null
        }
        Insert: {
          academic_session?: string | null
          admission_number?: string | null
          admission_type?: string | null
          alt_phone_number?: string | null
          applying_for_grade?: string | null
          bece_result?: string | null
          certification_agreed?: boolean
          common_entrance_score?: string | null
          country?: string | null
          created_at?: string
          current_class?: string | null
          current_school?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_number?: string | null
          employer?: string | null
          father_name?: string | null
          gender?: string | null
          guardian_name?: string | null
          guardian_relationship?: string | null
          id?: string
          local_government?: string | null
          mother_name?: string | null
          nationality?: string | null
          neco_result?: string | null
          occupation?: string | null
          phone_number?: string | null
          photo_url?: string | null
          previous_class?: string | null
          previous_schools?: string | null
          religion?: string | null
          residential_address?: string | null
          state?: string | null
          state_of_origin?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          student_first_name?: string | null
          student_last_name?: string | null
          student_middle_name?: string | null
          submitted_at?: string | null
          updated_at?: string
          waec_result?: string | null
        }
        Update: {
          academic_session?: string | null
          admission_number?: string | null
          admission_type?: string | null
          alt_phone_number?: string | null
          applying_for_grade?: string | null
          bece_result?: string | null
          certification_agreed?: boolean
          common_entrance_score?: string | null
          country?: string | null
          created_at?: string
          current_class?: string | null
          current_school?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_number?: string | null
          employer?: string | null
          father_name?: string | null
          gender?: string | null
          guardian_name?: string | null
          guardian_relationship?: string | null
          id?: string
          local_government?: string | null
          mother_name?: string | null
          nationality?: string | null
          neco_result?: string | null
          occupation?: string | null
          phone_number?: string | null
          photo_url?: string | null
          previous_class?: string | null
          previous_schools?: string | null
          religion?: string | null
          residential_address?: string | null
          state?: string | null
          state_of_origin?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          student_first_name?: string | null
          student_last_name?: string | null
          student_middle_name?: string | null
          submitted_at?: string | null
          updated_at?: string
          waec_result?: string | null
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
          role: Database["public"]["Enums"]["app_role"]
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
      generate_admission_number: { Args: never; Returns: string }
      get_application_status: {
        Args: { _admission_number: string }
        Returns: {
          admission_number: string
          applying_for_grade: string
          photo_url: string
          status: Database["public"]["Enums"]["application_status"]
          student_first_name: string
          student_last_name: string
          submitted_at: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      submit_application: { Args: { _application_id: string }; Returns: string }
    }
    Enums: {
      app_role: "admin"
      application_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "entrance_exam"
        | "interview"
        | "provisionally_admitted"
        | "admission_offered"
        | "rejected"
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
      app_role: ["admin"],
      application_status: [
        "draft",
        "submitted",
        "under_review",
        "entrance_exam",
        "interview",
        "provisionally_admitted",
        "admission_offered",
        "rejected",
      ],
    },
  },
} as const
