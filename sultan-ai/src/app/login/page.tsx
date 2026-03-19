"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Crown, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ phone: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#004D40] border border-[#D4AF37]/50 flex items-center justify-center mx-auto mb-4 gold-glow">
            <Crown className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-2xl font-black gold-text">Sultan-AI</h1>
          <p className="text-sm text-[#a5c9bb] mt-1">Apne dashboard mein wapis ayen</p>
          <p className="text-base urdu-text text-[#D4AF37] mt-1">خوش آمدید</p>
        </div>

        <form onSubmit={handleLogin} className="glass-card-strong rounded-2xl p-7 space-y-4">
          <div>
            <label className="text-xs text-[#a5c9bb] block mb-1.5">Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+92 300 1234567"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-[#004D40]/20 border border-[rgba(212,175,55,0.15)] text-[#e8f5e9] text-sm placeholder:text-[#5a7a72] outline-none focus:border-[#D4AF37]/40"
            />
          </div>
          <div>
            <label className="text-xs text-[#a5c9bb] block mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 pr-10 rounded-xl bg-[#004D40]/20 border border-[rgba(212,175,55,0.15)] text-[#e8f5e9] text-sm placeholder:text-[#5a7a72] outline-none focus:border-[#D4AF37]/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a7a72] hover:text-[#a5c9bb]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#D4AF37] text-[#0a0f0e] hover:bg-[#E8C547] font-bold py-6 text-base gold-glow"
          >
            {isLoading ? "Login ho raha hai..." : (
              <><Crown className="w-4 h-4 mr-2" /> Sultan Dashboard Kholen</>
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-[#5a7a72] mt-4">
          Naye hain?{" "}
          <Link href="/onboarding" className="text-[#D4AF37] hover:underline">Account banayein</Link>
        </p>
      </div>
    </div>
  );
}
