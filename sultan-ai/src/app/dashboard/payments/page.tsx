import { createClient } from "@/lib/supabase-server";
import { getRecentPayments } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Smartphone, Zap } from "lucide-react";

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

const paymentMethods = [
  { id: "easypaisa", name: "EasyPaisa",  color: "#00A651", logo: "EP", description: "Telenor Pakistan ka mobile wallet", features: ["Balance verification", "Payment confirmation", "Auto-reconciliation"] },
  { id: "jazzcash",  name: "JazzCash",   color: "#ED1C24", logo: "JC", description: "Jazz (Veon) ka digital payment platform", features: ["Screenshot verification (AI)", "Instant confirmation", "Monthly statement"] },
  { id: "sadapay",   name: "SadaPay",    color: "#5046E5", logo: "SP", description: "Pakistan ka naya-zamanay ka digital bank", features: ["IBAN transfer verification", "Real-time notifications", "API integration"] },
  { id: "nayapay",   name: "NayaPay",    color: "#FF6B35", logo: "NP", description: "NayaPay digital wallet integration", features: ["QR code payments", "Merchant dashboard", "Analytics"] },
];

const sourceLabel: Record<string, string> = { whatsapp: "WhatsApp", manual: "Cash/Bank", voice: "Voice" };

export default async function PaymentsPage() {
  const merchantId = await getMerchantId();
  const recentPayments = merchantId ? await getRecentPayments(merchantId) : [];
  const confirmed = recentPayments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-5">
        <h2 className="text-lg font-bold text-[#e8f5e9] mb-1">Fintech Integrations</h2>
        <p className="text-sm text-[#a5c9bb]">
          Pakistan ke top mobile wallets ke saath seamless payment verification. Sultan-AI automatically confirm kar ke Khata update karta hai.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {paymentMethods.map((pm) => (
          <div key={pm.id} className="glass-card rounded-2xl p-5 flex flex-col gap-4 animated-border">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-sm" style={{ background: pm.color }}>
                {pm.logo}
              </div>
              <Badge className="bg-yellow-900/40 text-yellow-400 border-yellow-700/30 text-[10px]">
                <Clock className="w-2.5 h-2.5 mr-1" /> Coming Soon
              </Badge>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#e8f5e9]">{pm.name}</h3>
              <p className="text-xs text-[#a5c9bb] mt-0.5">{pm.description}</p>
            </div>
            <ul className="space-y-1.5">
              {pm.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-[#a5c9bb]">
                  <CheckCircle2 className="w-3 h-3 text-[#004D40]" /> {f}
                </li>
              ))}
            </ul>
            <Button disabled variant="outline" size="sm" className="border-[#004D40] text-[#a5c9bb] text-xs mt-auto">
              <Zap className="w-3 h-3 mr-1" /> Connect
            </Button>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#e8f5e9]">Recent Payments</h3>
          <Badge className="bg-[#004D40]/60 text-[#D4AF37] border-[#D4AF37]/30">
            PKR {confirmed.toLocaleString()} total
          </Badge>
        </div>

        {recentPayments.length === 0 ? (
          <div className="text-center py-8 text-[#5a7a72] text-sm">
            Koi payments nahi abhi. Khata mein payment entry dalen.
          </div>
        ) : (
          <div className="space-y-3">
            {recentPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3 px-4 rounded-xl bg-[#004D40]/12 border border-[rgba(212,175,55,0.08)]">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-[#a5c9bb]" />
                  <div>
                    <div className="text-sm font-medium text-[#e8f5e9]">{p.customer_name}</div>
                    <div className="text-xs text-[#a5c9bb]">
                      {sourceLabel[p.source ?? "manual"] ?? p.source} · {new Date(p.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-green-400">PKR {p.amount.toLocaleString()}</span>
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
