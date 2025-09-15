export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string
          city: string
          state: string
          has_residence: boolean
          has_internet: boolean
          has_space: boolean
          referral_source: string | null
          referral_code: string | null
          session_id: string | null
          ip_address: string | null
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          user_agent: string | null
          screen_resolution: string | null
          submission_time: string
          time_to_complete: number | null
          status: 'new' | 'contacted' | 'qualified' | 'approved' | 'rejected' | 'installed'
          monthly_earnings: number | null
          equipment_type: string | null
          installation_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          phone: string
          city: string
          state: string
          has_residence: boolean
          has_internet: boolean
          has_space: boolean
          referral_source?: string | null
          referral_code?: string | null
          session_id?: string | null
          ip_address?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          user_agent?: string | null
          screen_resolution?: string | null
          submission_time?: string
          time_to_complete?: number | null
          status?: 'new' | 'contacted' | 'qualified' | 'approved' | 'rejected' | 'installed'
          monthly_earnings?: number | null
          equipment_type?: string | null
          installation_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string
          city?: string
          state?: string
          has_residence?: boolean
          has_internet?: boolean
          has_space?: boolean
          referral_source?: string | null
          referral_code?: string | null
          session_id?: string | null
          ip_address?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          user_agent?: string | null
          screen_resolution?: string | null
          submission_time?: string
          time_to_complete?: number | null
          status?: 'new' | 'contacted' | 'qualified' | 'approved' | 'rejected' | 'installed'
          monthly_earnings?: number | null
          equipment_type?: string | null
          installation_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          role: 'user' | 'admin' | 'affiliate'
          email_verified: boolean
          last_login: string | null
          referral_code: string | null
          referral_count: number
          total_earnings: number
          status: 'active' | 'inactive' | 'suspended'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          phone?: string | null
          role?: 'user' | 'admin' | 'affiliate'
          email_verified?: boolean
          last_login?: string | null
          referral_code?: string | null
          referral_count?: number
          total_earnings?: number
          status?: 'active' | 'inactive' | 'suspended'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          role?: 'user' | 'admin' | 'affiliate'
          email_verified?: boolean
          last_login?: string | null
          referral_code?: string | null
          referral_count?: number
          total_earnings?: number
          status?: 'active' | 'inactive' | 'suspended'
          created_at?: string
          updated_at?: string
        }
      }
      admins: {
        Row: {
          id: string
          email: string
          name: string
          password_hash: string
          role: 'admin' | 'super_admin'
          permissions: string[]
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          password_hash: string
          role?: 'admin' | 'super_admin'
          permissions?: string[]
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          password_hash?: string
          role?: 'admin' | 'super_admin'
          permissions?: string[]
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      affiliates: {
        Row: {
          id: string
          user_id: string
          referral_code: string
          total_referrals: number
          successful_referrals: number
          pending_commission: number
          paid_commission: number
          tier: 'bronze' | 'silver' | 'gold' | 'platinum'
          status: 'active' | 'inactive' | 'suspended'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          referral_code: string
          total_referrals?: number
          successful_referrals?: number
          pending_commission?: number
          paid_commission?: number
          tier?: 'bronze' | 'silver' | 'gold' | 'platinum'
          status?: 'active' | 'inactive' | 'suspended'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          referral_code?: string
          total_referrals?: number
          successful_referrals?: number
          pending_commission?: number
          paid_commission?: number
          tier?: 'bronze' | 'silver' | 'gold' | 'platinum'
          status?: 'active' | 'inactive' | 'suspended'
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: 'commission' | 'bonus' | 'monthly_earnings'
          status: 'pending' | 'processing' | 'completed' | 'failed'
          method: 'bank_transfer' | 'paypal' | 'check'
          reference_number: string | null
          processed_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: 'commission' | 'bonus' | 'monthly_earnings'
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          method: 'bank_transfer' | 'paypal' | 'check'
          reference_number?: string | null
          processed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: 'commission' | 'bonus' | 'monthly_earnings'
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          method?: 'bank_transfer' | 'paypal' | 'check'
          reference_number?: string | null
          processed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ab_tests: {
        Row: {
          id: string
          name: string
          description: string | null
          variants: Json
          status: 'draft' | 'running' | 'paused' | 'completed'
          start_date: string | null
          end_date: string | null
          winning_variant: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          variants?: Json
          status?: 'draft' | 'running' | 'paused' | 'completed'
          start_date?: string | null
          end_date?: string | null
          winning_variant?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          variants?: Json
          status?: 'draft' | 'running' | 'paused' | 'completed'
          start_date?: string | null
          end_date?: string | null
          winning_variant?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_lead_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_leads: number
          new_leads: number
          qualified_leads: number
          approved_leads: number
          conversion_rate: number
          average_time_to_complete: number
        }
      }
      get_top_states: {
        Args: {
          limit_count?: number
        }
        Returns: Array<{
          state: string
          count: number
        }>
      }
      get_referral_stats: {
        Args: {
          user_id: string
        }
        Returns: {
          total_referrals: number
          successful_referrals: number
          pending_commission: number
          paid_commission: number
        }
      }
    }
    Enums: {
      lead_status: 'new' | 'contacted' | 'qualified' | 'approved' | 'rejected' | 'installed'
      user_role: 'user' | 'admin' | 'affiliate'
      user_status: 'active' | 'inactive' | 'suspended'
      payment_type: 'commission' | 'bonus' | 'monthly_earnings'
      payment_status: 'pending' | 'processing' | 'completed' | 'failed'
      payment_method: 'bank_transfer' | 'paypal' | 'check'
      affiliate_tier: 'bronze' | 'silver' | 'gold' | 'platinum'
      ab_test_status: 'draft' | 'running' | 'paused' | 'completed'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}