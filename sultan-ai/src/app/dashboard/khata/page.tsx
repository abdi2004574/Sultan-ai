import { createClient } from "@/lib/supabase-server";
import { getKhataEntries } from "@/lib/queries";
import KhataClient from "./client";
import type { Database } from "@/types/database";

type KhataEntry = Database["public"]["Tables"]["khata_entries"]["Row"];

async function getMerchantId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return process.env.DEMO_MERCHANT_ID ?? null;
    const { data } = await supabase.from("merchants").select("id").eq("user_id", user.id).single();
    return data?.id ?? process.env.DEMO_MERCHANT_ID ?? null;
  } catch {
    return process.env.DEMO_MERCHANT_ID ?? null;
  }
}

export default async function KhataPage() {
  const merchantId = await getMerchantId();

  if (!merchantId) {
    return (
      <div className="flex items-center justify-center h-64 text-[#a5c9bb] text-sm">
        Database not connected. Add Supabase credentials to .env.local
      </div>
    );
  }

  const entries = await getKhataEntries(merchantId);
  return <KhataClient initialEntries={entries as KhataEntry[]} merchantId={merchantId} />;
}
