"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Zap, Shield, BarChart3, MessageSquare, Mic } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 glass-card-strong border-b border-[rgba(212,175,55,0.18)] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#004D40] border border-[#D4AF37]/40 flex items-center justify-center gold-glow">
            <Crown className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <span className="text-xl font-bold gold-text">Sultan-AI</span>
            <span className="ml-2 text-xs text-[#a5c9bb]">by Bazaar Tech</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-[#a5c9bb] hover:text-[#D4AF37] cursor-pointer">Login</Button>
          </Link>
          <Link href="/onboarding">
            <Button className="bg-[#D4AF37] text-[#0a0f0e] hover:bg-[#E8C547] font-semibold px-6 cursor-pointer">
              Shuru Karen
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#004D40]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-56 h-56 bg-[#D4AF37]/10 rounded-full blur-3xl" />
        </div>
        <Badge className="mb-6 bg-[#004D40]/60 text-[#D4AF37] border border-[#D4AF37]/30 px-4 py-1.5 text-sm relative z-10">
          🇵🇰 Pakistan ka Digital Sultan
        </Badge>
        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight relative z-10">
          <span className="gold-text">Sultan-AI</span>
          <br />
          <span className="text-[#e8f5e9]">Your Business,</span>
          <br />
          <span className="text-[#80CBC4]">Sovereign.</span>
        </h1>
        <p className="text-lg md:text-xl text-[#a5c9bb] max-w-2xl mb-4 relative z-10">
          AI-powered Khata management, WhatsApp automation in Roman Urdu, and intelligent debt recovery — built for Pakistan&apos;s 3.5M merchants.
        </p>
        <p className="text-2xl urdu-text text-[#D4AF37] mb-10 font-semibold relative z-10">
          آپ کا کاروبار، آپ کا سلطان
        </p>
        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
          <Link href="/onboarding">
            <Button size="lg" className="bg-[#D4AF37] text-[#0a0f0e] hover:bg-[#E8C547] font-bold px-10 py-6 text-lg gold-glow cursor-pointer">
              Free Mein Try Karen
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="border-[#004D40] text-[#80CBC4] hover:bg-[#004D40]/20 px-10 py-6 text-lg cursor-pointer">
              Live Demo Dekhen
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-16 max-w-6xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center mb-12 text-[#e8f5e9]">
          Merchant Ki Zaroorat, <span className="gold-text">Sultan Ki Taaqat</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="glass-card rounded-2xl p-6 animated-border hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-[#004D40]/60 border border-[#D4AF37]/30 flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="text-lg font-bold text-[#e8f5e9] mb-2">{f.title}</h3>
              <p className="text-[#a5c9bb] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-[#a5c9bb] text-sm border-t border-[rgba(212,175,55,0.1)]">
        © 2026 Sultan-AI · Karachi, Pakistan · Built for Bazaar merchants
      </footer>
    </main>
  );
}

const features = [
  {
    icon: BarChart3,
    title: "Merchant Hub",
    desc: "Real-time revenue tracking, debt recovery dashboard, and Sunday reports — all in one place.",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Engine",
    desc: "AI replies in Roman Urdu & Urdu script. Handles negotiations, reminders, and order confirmations automatically.",
  },
  {
    icon: Shield,
    title: "Max Discount Guardrail",
    desc: "Never lose margin again. Sultan enforces your maximum discount rules during every negotiation.",
  },
  {
    icon: Mic,
    title: "Voice-to-Ledger",
    desc: "Bolo aur likha jaye. Convert voice notes into structured Khata entries instantly via AI.",
  },
  {
    icon: Zap,
    title: "Memory Bank",
    desc: "Sultan never forgets a customer. AI remembers every negotiation pattern, payment behavior, and preference.",
  },
  {
    icon: Crown,
    title: "EasyPaisa / JazzCash",
    desc: "Integrated payment verification for Pakistan's top mobile wallets. One-tap payment confirmations.",
  },
];
