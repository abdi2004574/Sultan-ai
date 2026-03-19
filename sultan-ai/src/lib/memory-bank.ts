import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export interface MerchantMemory {
  customerPhone: string;
  patternType: "negotiation" | "payment_behavior" | "preference" | "risk";
  patternData: Record<string, unknown>;
  confidence: number;
}

export async function upsertMemory(merchantId: string, memory: MerchantMemory) {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("memory_bank")
    .upsert(
      {
        merchant_id: merchantId,
        customer_phone: memory.customerPhone,
        pattern_type: memory.patternType,
        pattern_data: memory.patternData,
        confidence: memory.confidence,
        last_updated: new Date().toISOString(),
      },
      { onConflict: "merchant_id,customer_phone,pattern_type" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCustomerMemory(merchantId: string, customerPhone: string) {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("memory_bank")
    .select("*")
    .eq("merchant_id", merchantId)
    .eq("customer_phone", customerPhone);

  if (error) throw error;
  return data ?? [];
}

export async function updateNegotiationPattern(
  merchantId: string,
  customerPhone: string,
  outcome: {
    requestedDiscount: number;
    acceptedDiscount: number;
    accepted: boolean;
    message: string;
  }
) {
  const existing = await getCustomerMemory(merchantId, customerPhone);
  const negPattern = existing.find((m) => m.pattern_type === "negotiation");

  const currentData = (negPattern?.pattern_data as Record<string, unknown>) ?? {};
  const history = (currentData.history as typeof outcome[]) ?? [];

  const updatedData = {
    ...currentData,
    history: [...history.slice(-19), outcome],
    avgRequestedDiscount: calculateAvg([...history, outcome].map((h) => h.requestedDiscount)),
    acceptanceRate: calculateAcceptanceRate([...history, outcome]),
    lastOutcome: outcome.accepted ? "accepted" : "rejected",
    lastUpdated: new Date().toISOString(),
  };

  const newConfidence = Math.min(1, (history.length + 1) / 10);

  return upsertMemory(merchantId, {
    customerPhone,
    patternType: "negotiation",
    patternData: updatedData,
    confidence: newConfidence,
  });
}

export async function buildMemoryContext(merchantId: string, customerPhone: string): Promise<string> {
  const memories = await getCustomerMemory(merchantId, customerPhone);

  if (memories.length === 0) return "Naye customer — koi history nahi";

  const parts: string[] = [];

  for (const mem of memories) {
    const data = mem.pattern_data as Record<string, unknown>;
    switch (mem.pattern_type) {
      case "negotiation":
        parts.push(`Negotiation: avg requested ${data.avgRequestedDiscount}%, acceptance rate ${data.acceptanceRate}%`);
        break;
      case "payment_behavior":
        parts.push(`Payment: ${data.avgPaymentDays} din mein pay karta hai, ${data.onTimeRate}% on-time`);
        break;
      case "risk":
        parts.push(`Risk Level: ${data.level} — ${data.reason}`);
        break;
    }
  }

  return parts.join(" | ");
}

function calculateAvg(nums: number[]): number {
  if (!nums.length) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function calculateAcceptanceRate(outcomes: { accepted: boolean }[]): number {
  if (!outcomes.length) return 0;
  const accepted = outcomes.filter((o) => o.accepted).length;
  return Math.round((accepted / outcomes.length) * 100);
}
