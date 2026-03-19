"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Crown, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const steps = [
  { id: 1, title: "Business Info", urdu: "کاروبار کی معلومات" },
  { id: 2, title: "Sultan Setup", urdu: "سلطان سیٹ اپ" },
  { id: 3, title: "WhatsApp Link", urdu: "واٹس ایپ لنک" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    phone: "",
    city: "Karachi",
    maxDiscount: "15",
    tone: "friendly",
    whatsappNumber: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const cities = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta"];

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#004D40] border border-[#D4AF37]/50 flex items-center justify-center mx-auto mb-4 gold-glow">
            <Crown className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-2xl font-black gold-text">Sultan-AI</h1>
          <p className="text-sm text-[#a5c9bb]">Aapka Sovereign Business OS</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 ${step >= s.id ? "text-[#D4AF37]" : "text-[#5a7a72]"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                  step > s.id
                    ? "bg-[#D4AF37] text-[#0a0f0e] border-[#D4AF37]"
                    : step === s.id
                    ? "bg-[#004D40]/60 border-[#D4AF37]/60 text-[#D4AF37]"
                    : "bg-[#004D40]/20 border-[rgba(212,175,55,0.15)] text-[#5a7a72]"
                }`}>
                  {step > s.id ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.id}
                </div>
                <span className="text-xs hidden sm:block">{s.title}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px mx-2 transition-all ${step > s.id ? "bg-[#D4AF37]/50" : "bg-[rgba(212,175,55,0.12)]"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="glass-card-strong rounded-2xl p-7">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-[#e8f5e9]">Business Info</h2>
                <p className="text-sm text-[#a5c9bb] urdu-text">اپنے کاروبار کی معلومات دیں</p>
              </div>
              <InputField label="Business Name" value={form.businessName} onChange={(v) => update("businessName", v)} placeholder="Ahmed Textiles, Khan Fabrics..." />
              <InputField label="Owner Name" value={form.ownerName} onChange={(v) => update("ownerName", v)} placeholder="Aapka naam" />
              <InputField label="Phone Number" value={form.phone} onChange={(v) => update("phone", v)} placeholder="+92 300 1234567" type="tel" />
              <div>
                <label className="text-xs text-[#a5c9bb] block mb-1.5">City</label>
                <select
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#004D40]/20 border border-[rgba(212,175,55,0.15)] text-[#e8f5e9] text-sm outline-none focus:border-[#D4AF37]/40"
                >
                  {cities.map((c) => <option key={c} value={c} className="bg-[#0d1a17]">{c}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-[#e8f5e9]">Sultan Setup</h2>
                <p className="text-sm text-[#a5c9bb]">AI ka behavior configure karen</p>
              </div>
              <div>
                <label className="text-xs text-[#a5c9bb] block mb-1.5">Maximum Discount % (Guardrail)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min="0" max="30" value={form.maxDiscount}
                    onChange={(e) => update("maxDiscount", e.target.value)}
                    className="flex-1 accent-[#D4AF37]"
                  />
                  <Badge className="bg-[#004D40]/60 text-[#D4AF37] border-[#D4AF37]/30 min-w-[50px] justify-center">
                    {form.maxDiscount}%
                  </Badge>
                </div>
                <p className="text-xs text-[#5a7a72] mt-1">Sultan AI kabhi bhi is se zyada discount nahi dega</p>
              </div>
              <div>
                <label className="text-xs text-[#a5c9bb] block mb-2">Sultan Tone (جواب کا انداز)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "friendly", label: "Dost 😊", urdu: "دوستانہ" },
                    { value: "formal", label: "Sahib 🤝", urdu: "رسمی" },
                    { value: "strict", label: "Sakht ⚖️", urdu: "سخت" },
                  ].map((t) => (
                    <button
                      key={t.value}
                      onClick={() => update("tone", t.value)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        form.tone === t.value
                          ? "bg-[#004D40]/60 border-[#D4AF37]/40 text-[#D4AF37]"
                          : "bg-[#004D40]/15 border-transparent text-[#a5c9bb]"
                      }`}
                    >
                      <div className="text-sm font-medium">{t.label}</div>
                      <div className="text-xs urdu-text text-[#5a7a72]">{t.urdu}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-[#e8f5e9]">WhatsApp Connect</h2>
                <p className="text-sm text-[#a5c9bb]">Business WhatsApp number link karen</p>
              </div>
              <InputField
                label="WhatsApp Business Number"
                value={form.whatsappNumber}
                onChange={(v) => update("whatsappNumber", v)}
                placeholder="+92 300 1234567"
                type="tel"
              />
              <div className="p-4 rounded-xl bg-[#004D40]/20 border border-[rgba(212,175,55,0.15)] space-y-2">
                <p className="text-xs font-semibold text-[#D4AF37]">Setup Instructions:</p>
                <ol className="text-xs text-[#a5c9bb] space-y-1 list-decimal list-inside">
                  <li>Meta Business Manager mein WhatsApp Business API enable karen</li>
                  <li>Webhook URL: <code className="text-[#D4AF37] bg-[#004D40]/40 px-1 rounded">your-domain.com/api/whatsapp</code></li>
                  <li>Verify token use karen: <code className="text-[#D4AF37] bg-[#004D40]/40 px-1 rounded">sultan_ai_verify_token</code></li>
                </ol>
              </div>
              <div className="p-4 rounded-xl bg-green-900/20 border border-green-700/30 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-green-400">Ready to Launch!</p>
                <p className="text-xs text-[#a5c9bb]">Sabhi settings configure ho gayi hain</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            {step > 1 ? (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)} className="text-[#a5c9bb]">
                <ArrowLeft className="w-4 h-4 mr-2" /> Wapis
              </Button>
            ) : <div />}
            {step < 3 ? (
              <Button onClick={() => setStep((s) => s + 1)} className="bg-[#D4AF37] text-[#0a0f0e] hover:bg-[#E8C547] font-semibold">
                Aage <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={() => router.push("/dashboard")} className="bg-[#D4AF37] text-[#0a0f0e] hover:bg-[#E8C547] font-bold px-6">
                <Crown className="w-4 h-4 mr-2" /> Sultan Dashboard Kholen
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-[#5a7a72] mt-4">
          Already registered?{" "}
          <Link href="/login" className="text-[#D4AF37] hover:underline">Login karen</Link>
        </p>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text" }: {
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
        className="w-full px-4 py-2.5 rounded-xl bg-[#004D40]/20 border border-[rgba(212,175,55,0.15)] text-[#e8f5e9] text-sm placeholder:text-[#5a7a72] outline-none focus:border-[#D4AF37]/40 transition-colors"
      />
    </div>
  );
}
