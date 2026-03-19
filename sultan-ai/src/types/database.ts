export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Database = {
  public: {
    Tables: {
      merchants: {
        Row: {
          id: string
          created_at: string
          user_id: string
          business_name: string
          owner_name: string
          phone: string
          city: string
          whatsapp_number: string | null
          tone_preference: string
          max_discount_percent: number
          monthly_revenue: number
          active_debts: number
          subscription_tier: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          business_name: string
          owner_name: string
          phone: string
          city?: string
          whatsapp_number?: string | null
          tone_preference?: string
          max_discount_percent?: number
          monthly_revenue?: number
          active_debts?: number
          subscription_tier?: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          business_name?: string
          owner_name?: string
          phone?: string
          city?: string
          whatsapp_number?: string | null
          tone_preference?: string
          max_discount_percent?: number
          monthly_revenue?: number
          active_debts?: number
          subscription_tier?: string
        }
        Relationships: []
      }
      khata_entries: {
        Row: {
          id: string
          created_at: string
          merchant_id: string
          customer_name: string
          customer_phone: string | null
          amount: number
          type: string
          description: string | null
          voice_note_url: string | null
          is_settled: boolean
          due_date: string | null
          source: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          merchant_id: string
          customer_name: string
          customer_phone?: string | null
          amount: number
          type: string
          description?: string | null
          voice_note_url?: string | null
          is_settled?: boolean
          due_date?: string | null
          source?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          merchant_id?: string
          customer_name?: string
          customer_phone?: string | null
          amount?: number
          type?: string
          description?: string | null
          voice_note_url?: string | null
          is_settled?: boolean
          due_date?: string | null
          source?: string | null
        }
        Relationships: []
      }
      whatsapp_conversations: {
        Row: {
          id: string
          created_at: string
          merchant_id: string
          customer_phone: string
          customer_name: string | null
          last_message: string | null
          last_message_at: string
          negotiation_mode: boolean
          discount_offered: number | null
          status: string
          sentiment: string | null
          language: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          merchant_id: string
          customer_phone: string
          customer_name?: string | null
          last_message?: string | null
          last_message_at?: string
          negotiation_mode?: boolean
          discount_offered?: number | null
          status?: string
          sentiment?: string | null
          language?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          merchant_id?: string
          customer_phone?: string
          customer_name?: string | null
          last_message?: string | null
          last_message_at?: string
          negotiation_mode?: boolean
          discount_offered?: number | null
          status?: string
          sentiment?: string | null
          language?: string | null
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          id: string
          created_at: string
          conversation_id: string
          merchant_id: string
          sender: string
          message: string
          message_type: string
          is_negotiation: boolean
          ai_confidence: number | null
          wa_message_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          conversation_id: string
          merchant_id: string
          sender: string
          message: string
          message_type?: string
          is_negotiation?: boolean
          ai_confidence?: number | null
          wa_message_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          conversation_id?: string
          merchant_id?: string
          sender?: string
          message?: string
          message_type?: string
          is_negotiation?: boolean
          ai_confidence?: number | null
          wa_message_id?: string | null
        }
        Relationships: []
      }
      memory_bank: {
        Row: {
          id: string
          created_at: string
          merchant_id: string
          customer_phone: string
          pattern_type: string
          pattern_data: Json
          confidence: number
          last_updated: string
        }
        Insert: {
          id?: string
          created_at?: string
          merchant_id: string
          customer_phone: string
          pattern_type: string
          pattern_data?: Json
          confidence?: number
          last_updated?: string
        }
        Update: {
          id?: string
          created_at?: string
          merchant_id?: string
          customer_phone?: string
          pattern_type?: string
          pattern_data?: Json
          confidence?: number
          last_updated?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
