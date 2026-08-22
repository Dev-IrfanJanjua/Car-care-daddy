// Hand-authored to match supabase/migrations/*.sql until a live project exists.
// Once linked, regenerate with: supabase gen types typescript --linked > lib/types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: Database['public']['Enums']['user_role']
          full_name: string | null
          phone: string | null
          created_at: string
        }
        Insert: {
          id: string
          role?: Database['public']['Enums']['user_role']
          full_name?: string | null
          phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          role?: Database['public']['Enums']['user_role']
          full_name?: string | null
          phone?: string | null
          created_at?: string
        }
        Relationships: []
      }
      vehicle_makes: {
        Row: { id: string; name: string }
        Insert: { id?: string; name: string }
        Update: { id?: string; name?: string }
        Relationships: []
      }
      vehicle_models: {
        Row: {
          id: string
          make_id: string
          name: string
          vehicle_class: Database['public']['Enums']['vehicle_class']
        }
        Insert: {
          id?: string
          make_id: string
          name: string
          vehicle_class: Database['public']['Enums']['vehicle_class']
        }
        Update: {
          id?: string
          make_id?: string
          name?: string
          vehicle_class?: Database['public']['Enums']['vehicle_class']
        }
        Relationships: []
      }
      services: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          category: string | null
          is_active: boolean
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          category?: string | null
          is_active?: boolean
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          category?: string | null
          is_active?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      service_prices: {
        Row: {
          id: string
          service_id: string
          vehicle_class: Database['public']['Enums']['vehicle_class']
          base_price: number
        }
        Insert: {
          id?: string
          service_id: string
          vehicle_class: Database['public']['Enums']['vehicle_class']
          base_price: number
        }
        Update: {
          id?: string
          service_id?: string
          vehicle_class?: Database['public']['Enums']['vehicle_class']
          base_price?: number
        }
        Relationships: []
      }
      quotes: {
        Row: {
          id: string
          created_at: string
          customer_id: string | null
          lead_id: string | null
          vehicle_make: string
          vehicle_model: string
          vehicle_year: number
          vehicle_class: Database['public']['Enums']['vehicle_class']
          line_items: Json
          subtotal: number
          discount: number
          total: number
          expires_at: string
          status: Database['public']['Enums']['quote_status']
        }
        Insert: {
          id?: string
          created_at?: string
          customer_id?: string | null
          lead_id?: string | null
          vehicle_make: string
          vehicle_model: string
          vehicle_year: number
          vehicle_class: Database['public']['Enums']['vehicle_class']
          line_items?: Json
          subtotal?: number
          discount?: number
          total?: number
          expires_at?: string
          status?: Database['public']['Enums']['quote_status']
        }
        Update: {
          id?: string
          created_at?: string
          customer_id?: string | null
          lead_id?: string | null
          vehicle_make?: string
          vehicle_model?: string
          vehicle_year?: number
          vehicle_class?: Database['public']['Enums']['vehicle_class']
          line_items?: Json
          subtotal?: number
          discount?: number
          total?: number
          expires_at?: string
          status?: Database['public']['Enums']['quote_status']
        }
        Relationships: []
      }
      leads: {
        Row: {
          id: string
          created_at: string
          full_name: string | null
          email: string | null
          phone: string | null
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_year: number | null
          service_ids: string[] | null
          quote_total: number | null
          status: Database['public']['Enums']['lead_status']
          converted_booking_id: string | null
          source: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_year?: number | null
          service_ids?: string[] | null
          quote_total?: number | null
          status?: Database['public']['Enums']['lead_status']
          converted_booking_id?: string | null
          source?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_year?: number | null
          service_ids?: string[] | null
          quote_total?: number | null
          status?: Database['public']['Enums']['lead_status']
          converted_booking_id?: string | null
          source?: string | null
        }
        Relationships: []
      }
      technicians: {
        Row: {
          id: string
          full_name: string
          email: string | null
          phone: string | null
          photo_url: string | null
          status: Database['public']['Enums']['technician_status']
          skills: string[] | null
        }
        Insert: {
          id?: string
          full_name: string
          email?: string | null
          phone?: string | null
          photo_url?: string | null
          status?: Database['public']['Enums']['technician_status']
          skills?: string[] | null
        }
        Update: {
          id?: string
          full_name?: string
          email?: string | null
          phone?: string | null
          photo_url?: string | null
          status?: Database['public']['Enums']['technician_status']
          skills?: string[] | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          quote_id: string | null
          customer_id: string | null
          customer_name: string
          customer_email: string
          customer_phone: string
          vehicle_make: string
          vehicle_model: string
          vehicle_year: number
          vehicle_class: Database['public']['Enums']['vehicle_class']
          service_address: string
          service_city: string
          service_zip: string
          scheduled_at: string
          status: Database['public']['Enums']['booking_status']
          assigned_technician_id: string | null
          total_amount: number
          deposit_amount: number | null
          deposit_paid: boolean
          notes: string | null
          access_token: string
          reminder_sent_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          quote_id?: string | null
          customer_id?: string | null
          customer_name: string
          customer_email: string
          customer_phone: string
          vehicle_make: string
          vehicle_model: string
          vehicle_year: number
          vehicle_class: Database['public']['Enums']['vehicle_class']
          service_address: string
          service_city: string
          service_zip: string
          scheduled_at: string
          status?: Database['public']['Enums']['booking_status']
          assigned_technician_id?: string | null
          total_amount?: number
          deposit_amount?: number | null
          deposit_paid?: boolean
          notes?: string | null
          access_token?: string
          reminder_sent_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          quote_id?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_email?: string
          customer_phone?: string
          vehicle_make?: string
          vehicle_model?: string
          vehicle_year?: number
          vehicle_class?: Database['public']['Enums']['vehicle_class']
          service_address?: string
          service_city?: string
          service_zip?: string
          scheduled_at?: string
          status?: Database['public']['Enums']['booking_status']
          assigned_technician_id?: string | null
          total_amount?: number
          deposit_amount?: number | null
          deposit_paid?: boolean
          notes?: string | null
          access_token?: string
          reminder_sent_at?: string | null
        }
        Relationships: []
      }
      booking_services: {
        Row: { id: string; booking_id: string; service_id: string; price: number }
        Insert: { id?: string; booking_id: string; service_id: string; price: number }
        Update: { id?: string; booking_id?: string; service_id?: string; price?: number }
        Relationships: []
      }
      partners: {
        Row: {
          id: string
          name: string
          type: Database['public']['Enums']['partner_type']
          contact_name: string | null
          contact_email: string | null
          contact_phone: string | null
          commission_rate: number | null
          notes: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: Database['public']['Enums']['partner_type']
          contact_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          commission_rate?: number | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: Database['public']['Enums']['partner_type']
          contact_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          commission_rate?: number | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      business_settings: {
        Row: {
          id: boolean
          business_name: string
          contact_email: string | null
          contact_phone: string | null
          hours: Json | null
          service_area: Json | null
        }
        Insert: {
          id?: boolean
          business_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          hours?: Json | null
          service_area?: Json | null
        }
        Update: {
          id?: boolean
          business_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          hours?: Json | null
          service_area?: Json | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          booking_id: string
          customer_id: string | null
          rating: number
          comment: string | null
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          customer_id?: string | null
          rating: number
          comment?: string | null
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          customer_id?: string | null
          rating?: number
          comment?: string | null
          is_public?: boolean
          created_at?: string
        }
        Relationships: []
      }
      photos: {
        Row: {
          id: string
          quote_id: string | null
          booking_id: string | null
          storage_path: string
          created_at: string
        }
        Insert: {
          id?: string
          quote_id?: string | null
          booking_id?: string | null
          storage_path: string
          created_at?: string
        }
        Update: {
          id?: string
          quote_id?: string | null
          booking_id?: string | null
          storage_path?: string
          created_at?: string
        }
        Relationships: []
      }
      insurance_claims: {
        Row: {
          id: string
          booking_id: string
          insurance_provider: string
          policy_number: string | null
          claim_number: string | null
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          insurance_provider: string
          policy_number?: string | null
          claim_number?: string | null
          status?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          insurance_provider?: string
          policy_number?: string | null
          claim_number?: string | null
          status?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      create_booking_with_services: {
        Args: {
          p_quote_id: string | null
          p_customer_name: string
          p_customer_email: string
          p_customer_phone: string
          p_vehicle_make: string
          p_vehicle_model: string
          p_vehicle_year: number
          p_vehicle_class: Database['public']['Enums']['vehicle_class']
          p_service_address: string
          p_service_city: string
          p_service_zip: string
          p_scheduled_at: string
          p_total_amount: number
          p_line_items: Json
        }
        Returns: { new_booking_id: string; new_access_token: string }[]
      }
    }
    Enums: {
      user_role: 'customer' | 'admin'
      // 'compact' | 'standard' | 'large' are the live price tiers (0007).
      // The six below are retired US body classes kept because Postgres
      // cannot drop an enum label in place. Do not use them for new rows.
      vehicle_class:
        | 'compact'
        | 'standard'
        | 'large'
        | 'sedan'
        | 'suv'
        | 'truck'
        | 'van'
        | 'coupe'
        | 'luxury'
      quote_status: 'active' | 'expired' | 'booked'
      lead_status: 'new' | 'contacted' | 'converted' | 'lost'
      booking_status:
        | 'pending'
        | 'confirmed'
        | 'in_progress'
        | 'completed'
        | 'cancelled'
        | 'no_show'
      technician_status: 'active' | 'inactive' | 'on_leave'
      partner_type: 'insurance' | 'dealership' | 'fleet' | 'referral'
    }
  }
}
