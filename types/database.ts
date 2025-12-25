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
      cash_balances: {
        Row: {
          amount: number
          currency: string
          id: string
          portfolio_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          currency: string
          id?: string
          portfolio_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          currency?: string
          id?: string
          portfolio_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fx_rates: {
        Row: {
          pair: string
          rate: number
          updated_at: string | null
        }
        Insert: {
          pair: string
          rate: number
          updated_at?: string | null
        }
        Update: {
          pair?: string
          rate?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      holdings: {
        Row: {
          avg_cost: number
          currency: string
          id: string
          portfolio_id: string
          quantity: number
          symbol: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avg_cost?: number
          currency?: string
          id?: string
          portfolio_id: string
          quantity?: number
          symbol: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avg_cost?: number
          currency?: string
          id?: string
          portfolio_id?: string
          quantity?: number
          symbol?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
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
      prices: {
        Row: {
          currency: string
          price: number
          symbol: string
          updated_at: string | null
        }
        Insert: {
          currency?: string
          price: number
          symbol: string
          updated_at?: string | null
        }
        Update: {
          currency?: string
          price?: number
          symbol?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      snapshots: {
        Row: {
          cash_value: number
          created_at: string | null
          currency: string
          date: string
          holdings_value: number
          id: string
          portfolio_id: string | null
          total_value: number
          usdils_rate: number | null
          user_id: string
        }
        Insert: {
          cash_value: number
          created_at?: string | null
          currency?: string
          date?: string
          holdings_value: number
          id?: string
          portfolio_id?: string | null
          total_value: number
          usdils_rate?: number | null
          user_id: string
        }
        Update: {
          cash_value?: number
          created_at?: string | null
          currency?: string
          date?: string
          holdings_value?: number
          id?: string
          portfolio_id?: string | null
          total_value?: number
          usdils_rate?: number | null
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string
          fee: number | null
          from_currency: string | null
          fx_rate: number | null
          id: string
          portfolio_id: string
          price: number | null
          quantity: number | null
          symbol: string | null
          to_currency: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string
          fee?: number | null
          from_currency?: string | null
          fx_rate?: number | null
          id?: string
          portfolio_id: string
          price?: number | null
          quantity?: number | null
          symbol?: string | null
          to_currency?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string
          fee?: number | null
          from_currency?: string | null
          fx_rate?: number | null
          id?: string
          portfolio_id?: string
          price?: number | null
          quantity?: number | null
          symbol?: string | null
          to_currency?: string | null
          type?: string
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

// Helper types
export type Portfolio = Database["public"]["Tables"]["portfolios"]["Row"]
export type PortfolioInsert = Database["public"]["Tables"]["portfolios"]["Insert"]
export type PortfolioUpdate = Database["public"]["Tables"]["portfolios"]["Update"]

export type Transaction = Database["public"]["Tables"]["transactions"]["Row"]
export type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"]

export type Holding = Database["public"]["Tables"]["holdings"]["Row"]
export type HoldingInsert = Database["public"]["Tables"]["holdings"]["Insert"]

export type CashBalance = Database["public"]["Tables"]["cash_balances"]["Row"]
export type CashBalanceInsert = Database["public"]["Tables"]["cash_balances"]["Insert"]

export type Snapshot = Database["public"]["Tables"]["snapshots"]["Row"]
export type SnapshotInsert = Database["public"]["Tables"]["snapshots"]["Insert"]

export type Price = Database["public"]["Tables"]["prices"]["Row"]
export type FxRate = Database["public"]["Tables"]["fx_rates"]["Row"]

export type TransactionType = 'BUY' | 'SELL' | 'DEPOSIT' | 'WITHDRAW' | 'CONVERT' | 'DIVIDEND'
export type Currency = 'USD' | 'ILS'
