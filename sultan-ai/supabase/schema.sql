-- Sultan-AI Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Merchants table
CREATE TABLE merchants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL DEFAULT 'Karachi',
  whatsapp_number TEXT,
  tone_preference TEXT DEFAULT 'friendly' CHECK (tone_preference IN ('formal', 'friendly', 'strict')),
  max_discount_percent NUMERIC(5,2) DEFAULT 10.00,
  monthly_revenue NUMERIC(12,2) DEFAULT 0,
  active_debts NUMERIC(12,2) DEFAULT 0,
  subscription_tier TEXT DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'pro', 'sultan'))
);

-- Khata (Ledger) entries
CREATE TABLE khata_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  amount NUMERIC(12,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'payment')),
  description TEXT,
  voice_note_url TEXT,
  is_settled BOOLEAN DEFAULT FALSE,
  due_date DATE,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'whatsapp', 'voice'))
);

-- WhatsApp Conversations
CREATE TABLE whatsapp_conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  negotiation_mode BOOLEAN DEFAULT FALSE,
  discount_offered NUMERIC(5,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'pending')),
  sentiment TEXT DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  language TEXT DEFAULT 'roman_urdu' CHECK (language IN ('roman_urdu', 'urdu', 'english', 'mixed'))
);

-- WhatsApp Messages
CREATE TABLE whatsapp_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  conversation_id UUID REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('customer', 'ai', 'merchant')),
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'audio', 'image')),
  is_negotiation BOOLEAN DEFAULT FALSE,
  ai_confidence NUMERIC(3,2),
  wa_message_id TEXT UNIQUE
);

-- Memory Bank (AI Merchant Patterns)
CREATE TABLE memory_bank (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  customer_phone TEXT NOT NULL,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('negotiation', 'payment_behavior', 'preference', 'risk')),
  pattern_data JSONB NOT NULL DEFAULT '{}',
  confidence NUMERIC(3,2) DEFAULT 0.5,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(merchant_id, customer_phone, pattern_type)
);

-- RLS Policies
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE khata_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_bank ENABLE ROW LEVEL SECURITY;

-- Merchant isolation: each merchant only sees their own data
CREATE POLICY "merchants_own_data" ON merchants FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "khata_merchant_data" ON khata_entries FOR ALL USING (
  merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid())
);
CREATE POLICY "wa_conversations_merchant" ON whatsapp_conversations FOR ALL USING (
  merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid())
);
CREATE POLICY "wa_messages_merchant" ON whatsapp_messages FOR ALL USING (
  merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid())
);
CREATE POLICY "memory_bank_merchant" ON memory_bank FOR ALL USING (
  merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid())
);

-- Indexes
CREATE INDEX idx_khata_merchant ON khata_entries(merchant_id);
CREATE INDEX idx_khata_settled ON khata_entries(is_settled);
CREATE INDEX idx_wa_conv_merchant ON whatsapp_conversations(merchant_id);
CREATE INDEX idx_wa_conv_status ON whatsapp_conversations(status);
CREATE INDEX idx_wa_msg_conv ON whatsapp_messages(conversation_id);
CREATE INDEX idx_memory_merchant_phone ON memory_bank(merchant_id, customer_phone);
