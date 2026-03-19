-- Sultan-AI Demo Seed Data
-- Run AFTER schema.sql
-- Replace 'YOUR_USER_UUID' with your actual Supabase auth user UUID

DO $$
DECLARE
  v_user_id UUID := 'YOUR_USER_UUID'; -- replace this
  v_merchant_id UUID;
  v_conv1_id UUID;
  v_conv2_id UUID;
  v_conv3_id UUID;
BEGIN

-- Insert demo merchant
INSERT INTO merchants (user_id, business_name, owner_name, phone, city, whatsapp_number, tone_preference, max_discount_percent, monthly_revenue, active_debts, subscription_tier)
VALUES (v_user_id, 'Ahmed Textiles', 'Ahmed Raza', '+92-300-1234567', 'Karachi', '+92-300-1234567', 'friendly', 15.00, 512000, 193500, 'pro')
RETURNING id INTO v_merchant_id;

-- Khata entries (last 6 months)
INSERT INTO khata_entries (merchant_id, customer_name, customer_phone, amount, type, description, is_settled, source, created_at, due_date) VALUES
(v_merchant_id, 'Rana Bros',       '+92-300-1111111', 45000, 'debit',   '50 pieces lawn suit - bulk order',         false, 'whatsapp', NOW() - INTERVAL '8 days',   (NOW() + INTERVAL '4 days')::DATE),
(v_merchant_id, 'DHA Mart',        '+92-321-2222222', 72000, 'debit',   'Embroidery collection bulk March',          false, 'manual',   NOW() - INTERVAL '18 days',  (NOW() - INTERVAL '4 days')::DATE),
(v_merchant_id, 'Gulshan Store',   '+92-333-3333333', 28500, 'debit',   '30 pieces summer collection',              false, 'voice',    NOW() - INTERVAL '5 days',   (NOW() + INTERVAL '10 days')::DATE),
(v_merchant_id, 'Tariq Traders',   '+92-345-4444444', 15000, 'debit',   'Khaddar winter stock',                     false, 'manual',   NOW() - INTERVAL '2 days',   (NOW() + INTERVAL '13 days')::DATE),
(v_merchant_id, 'Saima Fashion',   '+92-312-5555555', 33000, 'debit',   'Chiffon dupatta set x20',                  false, 'whatsapp', NOW() - INTERVAL '10 days',  (NOW() + INTERVAL '5 days')::DATE),
-- Payments received
(v_merchant_id, 'Saima Fashion',   '+92-312-5555555', 25500, 'payment', 'Payment received JazzCash',                true,  'whatsapp', NOW() - INTERVAL '1 days',   NULL),
(v_merchant_id, 'City Boutique',   '+92-311-6666666', 48000, 'payment', 'Full payment - bank transfer',             true,  'manual',   NOW() - INTERVAL '3 days',   NULL),
(v_merchant_id, 'Tariq Traders',   '+92-345-4444444', 12500, 'payment', 'Partial payment cash',                     true,  'manual',   NOW() - INTERVAL '4 days',   NULL),
(v_merchant_id, 'Faiza Collection','+92-322-7777777', 62000, 'payment', 'EasyPaisa payment confirmed',              true,  'whatsapp', NOW() - INTERVAL '6 days',   NULL),
(v_merchant_id, 'Rana Bros',       '+92-300-1111111', 30000, 'payment', 'Partial payment against March order',     true,  'whatsapp', NOW() - INTERVAL '2 days',   NULL),
-- Older months for revenue chart
(v_merchant_id, 'Bulk Customer A', NULL,              285000,'payment', 'October total collections',                true,  'manual',   NOW() - INTERVAL '5 months', NULL),
(v_merchant_id, 'Bulk Customer B', NULL,              320000,'payment', 'November total collections',               true,  'manual',   NOW() - INTERVAL '4 months', NULL),
(v_merchant_id, 'Bulk Customer C', NULL,              415000,'payment', 'December total collections',               true,  'manual',   NOW() - INTERVAL '3 months', NULL),
(v_merchant_id, 'Bulk Customer D', NULL,              380000,'payment', 'January total collections',                true,  'manual',   NOW() - INTERVAL '2 months', NULL),
(v_merchant_id, 'Bulk Customer E', NULL,              460000,'payment', 'February total collections',               true,  'manual',   NOW() - INTERVAL '1 month',  NULL);

-- WhatsApp conversations
INSERT INTO whatsapp_conversations (id, merchant_id, customer_phone, customer_name, last_message, last_message_at, negotiation_mode, discount_offered, status, sentiment, language)
VALUES
  (gen_random_uuid(), v_merchant_id, '+92-300-1111111', 'Rana Shahid',  'Bhai 20% discount chahiye warna doosri dukaan se le lega', NOW() - INTERVAL '2 minutes', true,  8,    'active',   'negative', 'roman_urdu'),
  (gen_random_uuid(), v_merchant_id, '+92-321-2222222', 'DHA Mart',     'Payment kal karein ge, confirm kar dein?',                  NOW() - INTERVAL '5 minutes', false, NULL, 'active',   'neutral',  'roman_urdu'),
  (gen_random_uuid(), v_merchant_id, '+92-312-5555555', 'Saima Fashion','JazzCash se payment ho gayi, screenshot bheja',             NOW() - INTERVAL '12 minutes',false, NULL, 'resolved', 'positive', 'roman_urdu')
RETURNING id INTO v_conv1_id;

-- Memory bank patterns
INSERT INTO memory_bank (merchant_id, customer_phone, pattern_type, pattern_data, confidence) VALUES
(v_merchant_id, '+92-300-1111111', 'negotiation',       '{"avgRequestedDiscount":18,"acceptanceRate":40,"lastOutcome":"rejected","history":[]}', 0.7),
(v_merchant_id, '+92-300-1111111', 'payment_behavior',  '{"avgPaymentDays":4,"onTimeRate":65,"preferredMethod":"cash"}',                        0.8),
(v_merchant_id, '+92-300-1111111', 'risk',              '{"level":"medium","reason":"Frequently haggles, occasional late payment"}',             0.6),
(v_merchant_id, '+92-321-2222222', 'payment_behavior',  '{"avgPaymentDays":2,"onTimeRate":90,"preferredMethod":"bank_transfer"}',                0.9),
(v_merchant_id, '+92-312-5555555', 'negotiation',       '{"avgRequestedDiscount":5,"acceptanceRate":90,"lastOutcome":"accepted","history":[]}',  0.8),
(v_merchant_id, '+92-312-5555555', 'risk',              '{"level":"low","reason":"Reliable payer, loyal customer 2+ years"}',                   0.9);

RAISE NOTICE 'Seed complete. Merchant ID: %', v_merchant_id;
END $$;
