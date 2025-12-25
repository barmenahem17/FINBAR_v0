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
      portfolios: {
        Row: {
          account_number: string | null
          created_at: string | null
          fee_amount: number | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_number?: string | null
          created_at?: string | null
          fee_amount?: number | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_number?: string | null
          created_at?: string | null
          fee_amount?: number | null
          id?: string
          name?: string
          updated_at?: string | null
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Portfolio = Database["public"]["Tables"]["portfolios"]["Row"]
export type PortfolioInsert = Database["public"]["Tables"]["portfolios"]["Insert"]
export type PortfolioUpdate = Database["public"]["Tables"]["portfolios"]["Update"]

