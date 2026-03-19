"use client";

import { useState, useEffect, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Crown, Swords, PhoneCall, MessageSquare, AlertTriangle, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import type { Database } from "@/types/database";

type Conversation = Database["public"]["Tables"]["whatsapp_conversations"]["Row"];
type Message = Database["public"]["Tables"]["whatsapp_messages"]["Row"];

interface Props {
  conversations: Conversation[];
  merchantId: string;
  defaultTone: string;
  maxDiscount: number;
}

const toneOptions = [
  { value: "friendly", label: "Dost (Friendly)", urdu: "دوستانہ", emoji: "😊" },
  { value: "formal",   label: "Sahib (Formal)",  urdu: "رسمی",     emoji: "🤝" },
  { value: "strict",   label: "Sakht (Strict)",   urdu: "سخت",     emoji: "⚖️" },
];

export default function SultanHubClient({ conversations: initial, merchantId, defaultTone, maxDiscount }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>(initial);
  const [activeConv, setActiveConv] = useState<Conversation | null>(initial[0] ?? null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [memory, setMemory] = useState<Record<string, unknown>[]>([]);
  const [tone, setTone] = useState(defaultTone);
  const [replyInput, setReplyInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConv) return;
    supabase
      .from("whatsapp_messages")
      .select("*")
      .eq("conversation_id", activeConv.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => setMessages((data ?? []) as Message[]));

    supabase
      .from("memory_bank")
      .select("*")
      .eq("merchant_id", merchantId)
      .eq("customer_phone", activeConv.customer_phone)
      .then(({ data }) => setMemory(data ?? []));
  }, [activeConv?.id]);

  // Realtime subscription for new messages
  useEffect(() => {
    if (!activeConv) return;
    const channel = supabase
      .channel(`messages:${activeConv.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "whatsapp_messages",
        filter: `conversation_id=eq.${activeConv.id}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConv?.id]);

  // Realtime subscription for conversation list updates
  useEffect(() => {
    const channel = supabase
      .channel(`conversations:${merchantId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "whatsapp_conversations",
        filter: `merchant_id=eq.${merchantId}`,
      }, () => {
        supabase
          .from("whatsapp_conversations")
          .select("*")
          .eq("merchant_id", merchantId)
          .order("last_message_at", { ascending: false })
          .limit(20)
          .then(({ data }) => setConversations((data ?? []) as Conversation[]));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [merchantId]);

  const handleSendReply = async () => {
    if (!replyInput.trim() || !activeConv) return;
    const text = replyInput;
    setReplyInput("");

    await supabase.from("whatsapp_messages").insert({
      conversation_id: activeConv.id,
      merchant_id: merchantId,
      sender: "merchant",
      message: text,
      message_type: "text",
      is_negotiation: false,
    });

    await supabase.from("whatsapp_conversations").update({
      last_message: text,
      last_message_at: new Date().toISOString(),
    }).eq("id", activeConv.id);
  };

  const getMemoryValue = (patternType: string, key: string, fallback = "—") => {
    const mem = memory.find((m) => (m as Record<string, unknown>).pattern_type === patternType);
    if (!mem) return fallback;
    const data = (mem as Record<string, unknown>).pattern_data as Record<string, unknown>;
    return String(data?.[key] ?? fallback);
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Conversation List */}
      <div className="w-80 flex-shrink-0 glass-card rounded-2xl flex flex-col">
        <div className="px-4 py-4 border-b border-[rgba(212,175,55,0.12)]">
          <h3 className="text-sm font-bold text-[#e8f5e9] mb-1">Live WhatsApp Stream</h3>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 pulse-dot" />
            <span className="text-xs text-[#a5c9bb]">
              {conversations.length} conversations · {conversations.filter((c) => c.negotiation_mode).length} negotiating
            </span>
          </div>
        </div>
        <ScrollArea className="flex-1">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-[#5a7a72] text-xs">
              Koi WhatsApp conversations nahi. Webhook connect karen.
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    activeConv?.id === conv.id
                      ? "bg-[#004D40]/50 border border-[#D4AF37]/30"
                      : "bg-[#004D40]/15 border border-transparent hover:border-[rgba(212,175,55,0.15)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#004D40] flex items-center justify-center text-xs font-bold text-[#D4AF37]">
                        {(conv.customer_name ?? conv.customer_phone)[0].toUpperCase()}
                      </div>
                      <span className="text-xs font-semibold text-[#e8f5e9] truncate max-w-[100px]">
                        {conv.customer_name ?? conv.customer_phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {conv.negotiation_mode && (
                        <Badge className="bg-orange-900/50 text-orange-400 border-orange-700/30 text-[10px] px-1.5 py-0">
                          <Swords className="w-2.5 h-2.5 mr-0.5" /> Neg
                        </Badge>
                      )}
                      <SentimentDot sentiment={conv.sentiment} />
                    </div>
                  </div>
                  <p className="text-[11px] text-[#a5c9bb] truncate">{conv.last_message ?? "..."}</p>
                  <p className="text-[10px] text-[#5a7a72] mt-0.5">
                    {new Date(conv.last_message_at).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Window */}
      {activeConv ? (
        <div className="flex-1 glass-card rounded-2xl flex flex-col">
          <div className="px-5 py-4 border-b border-[rgba(212,175,55,0.12)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#004D40] border border-[#D4AF37]/40 flex items-center justify-center font-bold text-[#D4AF37]">
                {(activeConv.customer_name ?? activeConv.customer_phone)[0].toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-bold text-[#e8f5e9]">{activeConv.customer_name ?? "Unknown"}</div>
                <div className="text-xs text-[#a5c9bb]">{activeConv.customer_phone}</div>
              </div>
              {activeConv.negotiation_mode && (
                <Badge className="bg-orange-900/50 text-orange-400 border-orange-700/30">
                  <Swords className="w-3 h-3 mr-1" /> Negotiation Mode
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="border-[#004D40] text-[#a5c9bb] hover:text-[#e8f5e9] text-xs">
                <PhoneCall className="w-3.5 h-3.5 mr-1" /> Call
              </Button>
              <Button size="sm" className="bg-[#004D40] text-[#D4AF37] hover:bg-[#00695C] text-xs border border-[#D4AF37]/30">
                <Crown className="w-3.5 h-3.5 mr-1" /> Sultan Reply
              </Button>
            </div>
          </div>

          {activeConv.negotiation_mode && (
            <div className="mx-4 mt-3 px-4 py-2.5 rounded-xl bg-orange-900/25 border border-orange-700/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-orange-300 font-medium">
                  Negotiation active · Max allowed: {maxDiscount}%
                  {activeConv.discount_offered && ` · Offered: ${activeConv.discount_offered}%`}
                </span>
              </div>
              <Badge className="bg-orange-900/50 text-orange-400 border-orange-700/40 text-[10px]">Guardrail Active</Badge>
            </div>
          )}

          <ScrollArea className="flex-1 px-5 py-4">
            {messages.length === 0 ? (
              <div className="text-center text-[#5a7a72] text-xs mt-8">Koi messages nahi abhi tak</div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "customer" ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      msg.sender === "customer"
                        ? "bg-[#004D40]/30 border border-[rgba(212,175,55,0.1)] text-[#e8f5e9]"
                        : msg.sender === "ai"
                        ? `bg-[#004D40]/60 border ${msg.is_negotiation ? "border-orange-700/40" : "border-[#D4AF37]/25"} text-[#e8f5e9]`
                        : "bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#e8f5e9]"
                    }`}>
                      {msg.sender === "ai" && (
                        <div className="flex items-center gap-1 mb-1">
                          <Crown className="w-3 h-3 text-[#D4AF37]" />
                          <span className="text-[10px] text-[#D4AF37] font-semibold">Sultan AI</span>
                          {msg.is_negotiation && (
                            <Badge className="bg-orange-900/50 text-orange-400 border-orange-700/30 text-[9px] px-1 py-0 ml-1">Negotiating</Badge>
                          )}
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{msg.message}</p>
                      <p className="text-[10px] text-[#5a7a72] mt-1 text-right">
                        {new Date(msg.created_at).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="px-4 py-3 border-t border-[rgba(212,175,55,0.12)]">
            <div className="flex gap-2">
              <input
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                placeholder="Manual reply karen (Enter to send)..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#004D40]/20 border border-[rgba(212,175,55,0.15)] text-[#e8f5e9] text-sm placeholder:text-[#5a7a72] outline-none focus:border-[#D4AF37]/40"
              />
              <Button onClick={handleSendReply} className="bg-[#D4AF37] text-[#0a0f0e] hover:bg-[#E8C547] px-4">
                <MessageSquare className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 glass-card rounded-2xl flex items-center justify-center text-[#5a7a72] text-sm">
          Left se conversation select karen
        </div>
      )}

      {/* Right Panel */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-4">
        <div className="glass-card rounded-2xl p-4">
          <h4 className="text-sm font-bold text-[#e8f5e9] mb-1">Sultan Tone</h4>
          <p className="text-xs text-[#a5c9bb] mb-3 urdu-text">جواب کا انداز</p>
          <div className="space-y-2">
            {toneOptions.map((t) => (
              <button
                key={t.value}
                onClick={() => setTone(t.value)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                  tone === t.value
                    ? "bg-[#004D40]/60 border border-[#D4AF37]/40 text-[#D4AF37]"
                    : "bg-[#004D40]/15 border border-transparent text-[#a5c9bb] hover:border-[rgba(212,175,55,0.15)]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{t.emoji}</span>
                  <span className="text-xs font-medium">{t.label}</span>
                </span>
                <span className="text-xs urdu-text text-[#5a7a72]">{t.urdu}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex-1 overflow-y-auto">
          <h4 className="text-sm font-bold text-[#e8f5e9] mb-3 flex items-center gap-2">
            <Crown className="w-3.5 h-3.5 text-[#D4AF37]" /> Memory Bank
          </h4>
          {activeConv ? (
            <div className="space-y-2.5 text-xs">
              <MemoryItem label="Avg Discount Asked" value={`${getMemoryValue("negotiation", "avgRequestedDiscount", "N/A")}%`} highlight />
              <MemoryItem label="Acceptance Rate" value={`${getMemoryValue("negotiation", "acceptanceRate", "N/A")}%`} />
              <MemoryItem label="Avg Payment Days" value={`${getMemoryValue("payment_behavior", "avgPaymentDays", "N/A")} din`} />
              <MemoryItem label="On-Time Rate" value={`${getMemoryValue("payment_behavior", "onTimeRate", "N/A")}%`} />
              <MemoryItem label="Preferred Payment" value={getMemoryValue("payment_behavior", "preferredMethod", "N/A")} />
              <MemoryItem label="Risk Level" value={getMemoryValue("risk", "level", "Unknown")} highlight />
              <MemoryItem label="Risk Reason" value={getMemoryValue("risk", "reason", "No data yet")} />
              {memory.length === 0 && (
                <p className="text-[#5a7a72] text-[10px] mt-2">Naye customer — koi history nahi abhi</p>
              )}
            </div>
          ) : (
            <p className="text-xs text-[#5a7a72]">Conversation select karen</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SentimentDot({ sentiment }: { sentiment: string | null }) {
  const colors: Record<string, string> = { positive: "bg-green-400", neutral: "bg-yellow-400", negative: "bg-red-400" };
  return <span className={`w-2 h-2 rounded-full ${colors[sentiment ?? "neutral"] ?? "bg-gray-400"} pulse-dot`} />;
}

function MemoryItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[#5a7a72]">{label}</span>
      <span className={highlight ? "text-[#D4AF37] font-semibold" : "text-[#a5c9bb]"}>{value}</span>
    </div>
  );
}
