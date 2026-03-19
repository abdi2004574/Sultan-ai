import { createClient } from "@/lib/supabase-server";
import { getMerchantStats, getRevenueByMonth, getWeeklySales, getDebtQueue } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, Clock } from "lucide-react";
import { RevenueChart, WeeklyChart } from "@/components/dashboard/charts";

const DEMO_MERCHANT_ID = process.env.DEMO_MERCHANT_ID ?? "";

async function getMerchantId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return DEMO_MERCHANT_ID || null;

    const { data } = await supabase
      .from("merchants")
      .select("id")
      .eq("user_id", user.id)
      .single();
    return (data?.id ?? DEMO_MERCHANT_ID) || null;
  } catch {
    return DEMO_MERCHANT_ID || null;
  }
}

export default async function MerchantHubPage() {
  const merchantId = await getMerchantId();

  if (!merchantId) {
    return <NoDatabaseState />;
  }

  const [stats, revenueData, weeklyData, debtQueue] = await Promise.all([
    getMerchantStats(merchantId),
    getRevenueByMonth(merchantId),
    getWeeklySales(merchantId),
    getDebtQueue(merchantId),
  ]);

  const totalDebt = debtQueue.reduce((s, d) => s + d.amount, 0);
  const overdueCount = debtQueue.filter((d) => d.status === "overdue").length;
  const peakDay = weeklyData.reduce((a, b) => (b.sales > a.sales ? b : a), weeklyData[0]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Monthly Revenue"
          value={`PKR ${(stats.monthlyRevenue / 1000).toFixed(0)}K`}
          change="This month"
          trend="up"
          sub="payments received"
        />
        <KpiCard
          label="Active Debts"
          value={`PKR ${(totalDebt / 1000).toFixed(0)}K`}
          change={overdueCount > 0 ? `${overdueCount} overdue` : "All on track"}
          trend={overdueCount > 0 ? "down" : "up"}
          sub="total outstanding"
          accentColor={overdueCount > 0 ? "text-red-400" : "text-green-400"}
        />
        <KpiCard
          label="WhatsApp Handled"
          value={String(stats.whatsappHandled)}
          change="This month"
          trend="up"
          sub="conversations"
        />
        <KpiCard
          label="Recovery Rate"
          value={`${stats.recoveryRate}%`}
          change={stats.recoveryRate >= 70 ? "Good standing" : "Needs attention"}
          trend={stats.recoveryRate >= 70 ? "up" : "down"}
          sub="debt recovered"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-[#e8f5e9]">Revenue Trend</h3>
              <p className="text-xs text-[#a5c9bb]">Last 6 months · PKR</p>
            </div>
            {revenueData.length > 1 && (
              <Badge className="bg-green-900/40 text-green-400 border-green-700/30">
                {revenueData.length} months
              </Badge>
            )}
          </div>
          {revenueData.length > 0 ? (
            <RevenueChart data={revenueData} />
          ) : (
            <EmptyChart label="No revenue data yet" />
          )}
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="mb-5">
            <h3 className="text-base font-bold text-[#e8f5e9]">Weekly Payments</h3>
            <p className="text-xs text-[#a5c9bb]">Current week · count</p>
          </div>
          {weeklyData.some((d) => d.sales > 0) ? (
            <>
              <WeeklyChart data={weeklyData} />
              {peakDay && (
                <p className="text-xs text-center text-[#a5c9bb] mt-2">
                  Peak: {peakDay.day} · {peakDay.sales} payments
                </p>
              )}
            </>
          ) : (
            <EmptyChart label="No payments this week" />
          )}
        </div>
      </div>

      {/* Debt Recovery Queue */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-[#e8f5e9]">Debt Recovery Queue</h3>
            <p className="text-xs text-[#a5c9bb]">Sultan AI will send WhatsApp reminders automatically</p>
          </div>
          {totalDebt > 0 && (
            <Badge className="bg-[#004D40]/60 text-[#D4AF37] border-[#D4AF37]/30">
              PKR {(totalDebt / 1000).toFixed(0)}K total
            </Badge>
          )}
        </div>
        {debtQueue.length === 0 ? (
          <div className="text-center py-8 text-[#a5c9bb] text-sm">
            Koi pending debt nahi — sab settle hai!
          </div>
        ) : (
          <div className="space-y-3">
            {debtQueue.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between py-3 px-4 rounded-xl bg-[#004D40]/15 border border-[rgba(212,175,55,0.1)] hover:border-[rgba(212,175,55,0.25)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#004D40]/60 flex items-center justify-center text-xs font-bold text-[#D4AF37]">
                    {d.customer_name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#e8f5e9]">{d.customer_name}</div>
                    <div className="text-xs text-[#a5c9bb]">{d.days} din se pending</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-bold text-[#e8f5e9]">
                    PKR {d.amount.toLocaleString()}
                  </div>
                  {d.status === "overdue" ? (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  label, value, change, trend, sub, accentColor,
}: {
  label: string; value: string; change: string; trend: "up" | "down"; sub: string; accentColor?: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-5 animated-border">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-[#a5c9bb] font-medium">{label}</span>
        {trend === "up"
          ? <TrendingUp className="w-4 h-4 text-green-400" />
          : <TrendingDown className="w-4 h-4 text-red-400" />}
      </div>
      <div className="text-2xl font-black text-[#e8f5e9] mb-1">{value}</div>
      <div className={`text-xs font-semibold ${accentColor ?? (trend === "up" ? "text-green-400" : "text-red-400")}`}>
        {change}
      </div>
      <div className="text-xs text-[#a5c9bb] mt-0.5">{sub}</div>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="h-[220px] flex items-center justify-center text-[#5a7a72] text-sm">
      {label}
    </div>
  );
}

function NoDatabaseState() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
      <div className="text-4xl">🗄️</div>
      <div>
        <h3 className="text-base font-bold text-[#e8f5e9] mb-1">Database not connected</h3>
        <p className="text-sm text-[#a5c9bb] max-w-sm">
          Add your Supabase credentials to <code className="text-[#D4AF37] bg-[#004D40]/40 px-1 rounded">.env.local</code> and run <code className="text-[#D4AF37] bg-[#004D40]/40 px-1 rounded">supabase/schema.sql</code> to get started.
        </p>
      </div>
    </div>
  );
}
