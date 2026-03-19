"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, TrendingUp, TrendingDown, CheckCircle2, Clock, AlertCircle, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import type { Database } from "@/types/database";

type KhataEntry = Database["public"]["Tables"]["khata_entries"]["Row"];

const typeConfig: Record<string, { label: string; icon: typeof TrendingUp; rowColor: string; badgeColor: string }> = {
  debit:   { label: "Udhar Diya",  icon: TrendingDown, rowColor: "bg-red-900/10",   badgeColor: "bg-red-900/40 text-red-400 border-red-700/30" },
  credit:  { label: "Mujhe Dena",  icon: TrendingUp,   rowColor: "bg-blue-900/10",  badgeColor: "bg-blue-900/40 text-blue-400 border-blue-700/30" },
  payment: { label: "Payment",      icon: CheckCircle2, rowColor: "bg-green-900/10", badgeColor: "bg-green-900/40 text-green-400 border-green-700/30" },
};

const sourceLabels: Record<string, string> = { manual: "Manual", whatsapp: "WhatsApp", voice: "Voice" };

interface Props {
  initialEntries: KhataEntry[];
  merchantId: string;
}

export default function KhataClient({ initialEntries, merchantId }: Props) {
  const [entries, setEntries] = useState<KhataEntry[]>(initialEntries);
  const [filter, setFilter] = useState<"all" | "pending" | "settled">("all");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settling, setSettling] = useState<string | null>(null);
  const [form, setForm] = useState({
    customer_name: "", customer_phone: "", amount: "",
    type: "debit" as "debit" | "credit" | "payment",
    description: "", due_date: "",
  });

  const supabase = createClient();

  const totalDebt = entries.filter((e) => e.type === "debit" && !e.is_settled).reduce((s, e) => s + e.amount, 0);
  const totalCollected = entries.filter((e) => e.type === "payment").reduce((s, e) => s + e.amount, 0);

  const filtered = entries.filter((e) => {
    if (filter === "pending") return !e.is_settled && e.type !== "payment";
    if (filter === "settled") return e.is_settled || e.type === "payment";
    return true;
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name || !form.amount) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("khata_entries")
        .insert({
          merchant_id: merchantId,
          customer_name: form.customer_name,
          customer_phone: form.customer_phone || null,
          amount: parseFloat(form.amount),
          type: form.type,
          description: form.description || null,
          due_date: form.due_date || null,
          is_settled: false,
          source: "manual",
        })
        .select()
        .single();

      if (error) throw error;
      setEntries((prev) => [data as KhataEntry, ...prev]);
      setShowForm(false);
      setForm({ customer_name: "", customer_phone: "", amount: "", type: "debit", description: "", due_date: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSettle = async (entryId: string) => {
    setSettling(entryId);
    try {
      const { data, error } = await supabase
        .from("khata_entries")
        .update({ is_settled: true })
        .eq("id", entryId)
        .select()
        .single();
      if (error) throw error;
      setEntries((prev) => prev.map((e) => (e.id === entryId ? (data as KhataEntry) : e)));
    } catch (err) {
      console.error(err);
    } finally {
      setSettling(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4 animated-border">
          <div className="text-xs text-[#a5c9bb] mb-1">Total Baaki (Pending)</div>
          <div className="text-2xl font-black text-red-400">PKR {totalDebt.toLocaleString()}</div>
          <div className="text-xs text-[#5a7a72] mt-0.5">Customers ke zimma</div>
        </div>
        <div className="glass-card rounded-2xl p-4 animated-border">
          <div className="text-xs text-[#a5c9bb] mb-1">Total Wusool Hua</div>
          <div className="text-2xl font-black text-green-400">PKR {totalCollected.toLocaleString()}</div>
          <div className="text-xs text-[#5a7a72] mt-0.5">Payments received</div>
        </div>
        <div className="glass-card rounded-2xl p-4 animated-border">
          <div className="text-xs text-[#a5c9bb] mb-1">Total Entries</div>
          <div className="text-2xl font-black text-[#D4AF37]">{entries.length}</div>
          <div className="text-xs text-[#5a7a72] mt-0.5">All transactions</div>
        </div>
      </div>

      {/* New Entry Form */}
      {showForm && (
        <form onSubmit={handleSave} className="glass-card-strong rounded-2xl p-5 border border-[#D4AF37]/25 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#e8f5e9]">Nai Khata Entry</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-[#5a7a72] hover:text-[#a5c9bb]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Customer Name *" value={form.customer_name} onChange={(v) => setForm({ ...form, customer_name: v })} placeholder="Rana bhai, DHA Mart..." />
            <Field label="Phone (optional)" value={form.customer_phone} onChange={(v) => setForm({ ...form, customer_phone: v })} placeholder="+92 300 ..." />
            <Field label="Amount (PKR) *" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} placeholder="5000" type="number" />
            <div>
              <label className="text-xs text-[#a5c9bb] block mb-1.5">Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as "debit" | "credit" | "payment" })}
                className="w-full px-3 py-2.5 rounded-xl bg-[#004D40]/20 border border-[rgba(212,175,55,0.15)] text-[#e8f5e9] text-sm outline-none focus:border-[#D4AF37]/40"
              >
                <option value="debit" className="bg-[#0d1a17]">Udhar Diya (Debit)</option>
                <option value="credit" className="bg-[#0d1a17]">Mujhe Dena (Credit)</option>
                <option value="payment" className="bg-[#0d1a17]">Payment Mili</option>
              </select>
            </div>
            <Field label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Kya hua..." />
            <Field label="Due Date" value={form.due_date} onChange={(v) => setForm({ ...form, due_date: v })} type="date" />
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={saving} className="bg-[#D4AF37] text-[#0a0f0e] hover:bg-[#E8C547] font-semibold">
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><CheckCircle2 className="w-4 h-4 mr-2" /> Save Entry</>}
            </Button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-[#e8f5e9] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#D4AF37]" /> Khata Entries
          </h3>
          <div className="flex items-center gap-2">
            {(["all", "pending", "settled"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                  filter === f
                    ? "bg-[#004D40]/60 text-[#D4AF37] border border-[#D4AF37]/30"
                    : "bg-[#004D40]/15 text-[#a5c9bb] border border-transparent hover:border-[rgba(212,175,55,0.15)]"
                }`}
              >
                {f === "all" ? "Sab" : f === "pending" ? "Pending" : "Settled"}
              </button>
            ))}
            {!showForm && (
              <Button size="sm" onClick={() => setShowForm(true)} className="bg-[#D4AF37] text-[#0a0f0e] hover:bg-[#E8C547] ml-2">
                <Plus className="w-3.5 h-3.5 mr-1" /> Nai Entry
              </Button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-10 text-[#5a7a72] text-sm">
            {filter === "pending" ? "Koi pending entries nahi" : filter === "settled" ? "Koi settled entries nahi" : "Koi entries nahi — pehli entry dalen!"}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((entry) => {
              const cfg = typeConfig[entry.type] ?? typeConfig.debit;
              const isOverdue = !entry.is_settled && entry.due_date && new Date(entry.due_date) < new Date();
              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-4 py-3 px-4 rounded-xl border border-[rgba(212,175,55,0.08)] hover:border-[rgba(212,175,55,0.2)] transition-colors ${cfg.rowColor}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${entry.type === "payment" ? "bg-green-900/40" : "bg-[#004D40]/40"}`}>
                    <cfg.icon className={`w-4 h-4 ${entry.type === "payment" ? "text-green-400" : entry.type === "debit" ? "text-red-400" : "text-blue-400"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-[#e8f5e9]">{entry.customer_name}</span>
                      <Badge className={cfg.badgeColor + " text-[10px] px-1.5 py-0"}>{cfg.label}</Badge>
                      {entry.source && (
                        <Badge className="bg-[#004D40]/40 text-[#a5c9bb] border-[rgba(212,175,55,0.1)] text-[10px] px-1.5 py-0">
                          {sourceLabels[entry.source] ?? entry.source}
                        </Badge>
                      )}
                    </div>
                    {entry.description && <div className="text-xs text-[#a5c9bb] truncate">{entry.description}</div>}
                  </div>
                  <div className="text-right flex-shrink-0 flex items-center gap-3">
                    <div>
                      <div className={`text-sm font-bold ${entry.type === "payment" ? "text-green-400" : "text-[#e8f5e9]"}`}>
                        PKR {entry.amount.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 justify-end">
                        {isOverdue ? (
                          <><AlertCircle className="w-3 h-3 text-red-400" /><span className="text-[10px] text-red-400">Overdue</span></>
                        ) : entry.is_settled ? (
                          <><CheckCircle2 className="w-3 h-3 text-green-400" /><span className="text-[10px] text-green-400">Settled</span></>
                        ) : (
                          <><Clock className="w-3 h-3 text-yellow-400" /><span className="text-[10px] text-yellow-400">{entry.due_date ?? new Date(entry.created_at).toLocaleDateString("en-PK")}</span></>
                        )}
                      </div>
                    </div>
                    {!entry.is_settled && entry.type !== "payment" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSettle(entry.id)}
                        disabled={settling === entry.id}
                        className="border-green-700/40 text-green-400 hover:bg-green-900/20 text-[10px] px-2 py-1 h-auto"
                      >
                        {settling === entry.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Settle"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="text-xs text-[#a5c9bb] block mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl bg-[#004D40]/20 border border-[rgba(212,175,55,0.15)] text-[#e8f5e9] text-sm placeholder:text-[#5a7a72] outline-none focus:border-[#D4AF37]/40 transition-colors"
      />
    </div>
  );
}
