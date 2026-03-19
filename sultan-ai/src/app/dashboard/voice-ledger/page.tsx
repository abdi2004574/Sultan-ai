"use client";

import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Upload, CheckCircle2, Loader2, Volume2 } from "lucide-react";

interface LedgerResult {
  transcription: string;
  ledgerEntry: {
    customerName: string;
    customerPhone: string | null;
    amount: number;
    type: "credit" | "debit" | "payment";
    description: string;
    dueDate: string | null;
  };
}

const typeColors: Record<string, string> = {
  debit: "bg-red-900/40 text-red-400 border-red-700/30",
  credit: "bg-blue-900/40 text-blue-400 border-blue-700/30",
  payment: "bg-green-900/40 text-green-400 border-green-700/30",
};

export default function VoiceLedgerPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<LedgerResult | null>(null);
  const [textInput, setTextInput] = useState("");
  const [savedEntries, setSavedEntries] = useState<LedgerResult["ledgerEntry"][]>([]);

  const handleTextProcess = async () => {
    if (!textInput.trim()) return;
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("text", textInput);
      const res = await fetch("/api/voice-ledger", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    setSavedEntries((prev) => [result.ledgerEntry, ...prev]);
    setResult(null);
    setTextInput("");
  };

  const examples = [
    "Rana bhai ko 3 pieces lawn suit 7500 rupay mein udhar diya",
    "Gulshan store ne 18000 rupay JazzCash se pay kar diye",
    "DHA Mart ko 50 pieces embroidery ka order diya hai 42500 mein",
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="text-lg font-bold text-[#e8f5e9] mb-1 flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-[#D4AF37]" /> Voice-to-Ledger
        </h2>
        <p className="text-sm text-[#a5c9bb]">
          Bolo aur Sultan-AI likhe ga. Apni awaz ya text mein khata entry dalo — AI automatically format kar ke khata mein save karega.
        </p>
        <p className="text-base urdu-text text-[#D4AF37] mt-2">بولو اور لکھا جائے</p>
      </div>

      {/* Input Area */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex gap-3 items-start">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Yahan apni khata entry likhein ya describe karen... (Roman Urdu ya Urdu mein)"
            className="flex-1 px-4 py-3 rounded-xl bg-[#004D40]/20 border border-[rgba(212,175,55,0.15)] text-[#e8f5e9] text-sm placeholder:text-[#5a7a72] outline-none focus:border-[#D4AF37]/40 resize-none h-24"
          />
        </div>

        {/* Example prompts */}
        <div>
          <p className="text-xs text-[#5a7a72] mb-2">Examples:</p>
          <div className="flex flex-wrap gap-2">
            {examples.map((ex) => (
              <button
                key={ex}
                onClick={() => setTextInput(ex)}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#004D40]/30 border border-[rgba(212,175,55,0.12)] text-[#a5c9bb] hover:text-[#e8f5e9] hover:border-[rgba(212,175,55,0.25)] transition-all"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleTextProcess}
            disabled={isProcessing || !textInput.trim()}
            className="bg-[#D4AF37] text-[#0a0f0e] hover:bg-[#E8C547] font-semibold"
          >
            {isProcessing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
            ) : (
              <><CheckCircle2 className="w-4 h-4 mr-2" /> Convert to Khata</>
            )}
          </Button>
          <Button variant="outline" className="border-[#004D40] text-[#a5c9bb] hover:text-[#e8f5e9]">
            <Mic className="w-4 h-4 mr-2" /> Record Voice
            <Badge className="ml-2 bg-yellow-900/40 text-yellow-400 border-yellow-700/30 text-[9px]">Soon</Badge>
          </Button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="glass-card-strong rounded-2xl p-5 border border-[#D4AF37]/30 gold-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#e8f5e9]">Sultan AI ne samjha:</h3>
            <Badge className="bg-green-900/40 text-green-400 border-green-700/30">Ready to Save</Badge>
          </div>
          {result.transcription && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-[#004D40]/20 border border-[rgba(212,175,55,0.1)]">
              <p className="text-xs text-[#a5c9bb]">Original: {result.transcription}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <InfoRow label="Customer" value={result.ledgerEntry.customerName} />
            <InfoRow label="Amount" value={`PKR ${result.ledgerEntry.amount.toLocaleString()}`} highlight />
            <InfoRow label="Type" value={
              <Badge className={typeColors[result.ledgerEntry.type]}>
                {result.ledgerEntry.type.toUpperCase()}
              </Badge>
            } />
            <InfoRow label="Due Date" value={result.ledgerEntry.dueDate ?? "Not specified"} />
            <div className="col-span-2">
              <InfoRow label="Description" value={result.ledgerEntry.description} />
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSave} className="bg-[#D4AF37] text-[#0a0f0e] hover:bg-[#E8C547] font-semibold">
              <CheckCircle2 className="w-4 h-4 mr-2" /> Khata Mein Save Karen
            </Button>
            <Button variant="ghost" onClick={() => setResult(null)} className="text-[#a5c9bb]">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Saved entries */}
      {savedEntries.length > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-[#e8f5e9] mb-4">Is Session Ki Entries</h3>
          <div className="space-y-2">
            {savedEntries.map((entry, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-[#004D40]/12 border border-[rgba(212,175,55,0.08)]">
                <div>
                  <span className="text-sm text-[#e8f5e9] font-medium">{entry.customerName}</span>
                  <span className="text-xs text-[#a5c9bb] ml-2">{entry.description}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={typeColors[entry.type]}>{entry.type}</Badge>
                  <span className="text-sm font-bold text-[#e8f5e9]">PKR {entry.amount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-[#5a7a72]">{label}</span>
      <span className={`text-sm ${highlight ? "font-bold text-[#D4AF37]" : "text-[#e8f5e9]"}`}>{value}</span>
    </div>
  );
}
