import { createClient } from "@/lib/supabase-server";
import { getWhatsappConversations } from "@/lib/queries";
import SultanHubClient from "./client";
import type { Database } from "@/types/database";

type Conversation = Database["public"]["Tables"]["whatsapp_conversations"]["Row"];

async function getMerchantId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return process.env.DEMO_MERCHANT_ID ?? null;
    const { data } = await supabase.from("merchants").select("id, max_discount_percent, tone_preference").eq("user_id", user.id).single();
    return data?.id ?? process.env.DEMO_MERCHANT_ID ?? null;
  } catch {
    return process.env.DEMO_MERCHANT_ID ?? null;
  }
}

async function getMerchantSettings(merchantId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("merchants").select("max_discount_percent, tone_preference").eq("id", merchantId).single();
  return { maxDiscount: data?.max_discount_percent ?? 15, tone: data?.tone_preference ?? "friendly" };
}

export default async function SultanHubPage() {
  const merchantId = await getMerchantId();

  if (!merchantId) {
    return (
      <div className="flex items-center justify-center h-64 text-[#a5c9bb] text-sm">
        Database not connected. Add Supabase credentials to .env.local
      </div>
    );
  }

  const [conversations, settings] = await Promise.all([
    getWhatsappConversations(merchantId),
    getMerchantSettings(merchantId),
  ]);

  return (
    <SultanHubClient
      conversations={conversations as Conversation[]}
      merchantId={merchantId}
      defaultTone={settings.tone}
      maxDiscount={settings.maxDiscount}
    />
  );
}
