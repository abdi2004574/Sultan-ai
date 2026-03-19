import { createClient } from "./supabase-server";

export async function getMerchantByUserId(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("merchants")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) return null;
  return data;
}

export async function getMerchantStats(merchantId: string) {
  const supabase = await createClient();

  const [khataRes, waRes] = await Promise.all([
    supabase
      .from("khata_entries")
      .select("amount, type, is_settled, created_at")
      .eq("merchant_id", merchantId),
    supabase
      .from("whatsapp_conversations")
      .select("id, status, created_at")
      .eq("merchant_id", merchantId),
  ]);

  const entries = khataRes.data ?? [];
  const conversations = waRes.data ?? [];

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const monthlyRevenue = entries
    .filter((e) => e.type === "payment" && e.created_at >= firstOfMonth)
    .reduce((sum, e) => sum + (e.amount ?? 0), 0);

  const activeDebts = entries
    .filter((e) => e.type === "debit" && !e.is_settled)
    .reduce((sum, e) => sum + (e.amount ?? 0), 0);

  const totalDebits = entries.filter((e) => e.type === "debit").reduce((s, e) => s + e.amount, 0);
  const totalPayments = entries.filter((e) => e.type === "payment").reduce((s, e) => s + e.amount, 0);
  const recoveryRate = totalDebits > 0 ? Math.round((totalPayments / totalDebits) * 100) : 0;

  const waThisMonth = conversations.filter((c) => c.created_at >= firstOfMonth).length;

  return { monthlyRevenue, activeDebts, recoveryRate, whatsappHandled: waThisMonth };
}

export async function getRevenueByMonth(merchantId: string) {
  const supabase = await createClient();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const { data } = await supabase
    .from("khata_entries")
    .select("amount, type, created_at")
    .eq("merchant_id", merchantId)
    .eq("type", "payment")
    .gte("created_at", sixMonthsAgo.toISOString())
    .order("created_at", { ascending: true });

  const grouped: Record<string, number> = {};
  for (const entry of data ?? []) {
    const month = new Date(entry.created_at).toLocaleString("default", { month: "short" });
    grouped[month] = (grouped[month] ?? 0) + entry.amount;
  }

  return Object.entries(grouped).map(([month, revenue]) => ({ month, revenue }));
}

export async function getWeeklySales(merchantId: string) {
  const supabase = await createClient();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data } = await supabase
    .from("khata_entries")
    .select("amount, created_at")
    .eq("merchant_id", merchantId)
    .eq("type", "payment")
    .gte("created_at", sevenDaysAgo.toISOString());

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const grouped: Record<string, number> = {};
  for (const entry of data ?? []) {
    const day = days[new Date(entry.created_at).getDay()];
    grouped[day] = (grouped[day] ?? 0) + 1;
  }

  return days.map((day) => ({ day, sales: grouped[day] ?? 0 }));
}

export async function getDebtQueue(merchantId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("khata_entries")
    .select("id, customer_name, customer_phone, amount, created_at, due_date")
    .eq("merchant_id", merchantId)
    .eq("type", "debit")
    .eq("is_settled", false)
    .order("due_date", { ascending: true })
    .limit(10);

  return (data ?? []).map((e) => {
    const days = e.due_date
      ? Math.floor((new Date().getTime() - new Date(e.due_date).getTime()) / 86400000)
      : Math.floor((new Date().getTime() - new Date(e.created_at).getTime()) / 86400000);
    return {
      ...e,
      days: Math.abs(days),
      status: e.due_date && new Date(e.due_date) < new Date() ? "overdue" : "pending",
    };
  });
}

export async function getKhataEntries(merchantId: string, filter: "all" | "pending" | "settled" = "all") {
  const supabase = await createClient();
  let query = supabase
    .from("khata_entries")
    .select("*")
    .eq("merchant_id", merchantId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (filter === "pending") query = query.eq("is_settled", false).neq("type", "payment");
  if (filter === "settled") query = query.or("is_settled.eq.true,type.eq.payment");

  const { data } = await query;
  return data ?? [];
}

export async function createKhataEntry(merchantId: string, entry: {
  customer_name: string;
  customer_phone?: string;
  amount: number;
  type: "credit" | "debit" | "payment";
  description?: string;
  due_date?: string;
  source?: "manual" | "whatsapp" | "voice";
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("khata_entries")
    .insert({ ...entry, merchant_id: merchantId, is_settled: false })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function settleKhataEntry(entryId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("khata_entries")
    .update({ is_settled: true })
    .eq("id", entryId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getWhatsappConversations(merchantId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("whatsapp_conversations")
    .select("*")
    .eq("merchant_id", merchantId)
    .order("last_message_at", { ascending: false })
    .limit(20);
  return data ?? [];
}

export async function getConversationMessages(conversationId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("whatsapp_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function getCustomerMemoryBank(merchantId: string, customerPhone: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("memory_bank")
    .select("*")
    .eq("merchant_id", merchantId)
    .eq("customer_phone", customerPhone);
  return data ?? [];
}

export async function getRecentPayments(merchantId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("khata_entries")
    .select("id, customer_name, amount, source, created_at, type")
    .eq("merchant_id", merchantId)
    .in("type", ["payment"])
    .order("created_at", { ascending: false })
    .limit(10);
  return data ?? [];
}
