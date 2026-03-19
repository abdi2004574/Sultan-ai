"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crown, LayoutDashboard, MessageSquare, BookOpen, Mic, CreditCard, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Merchant Hub", icon: LayoutDashboard },
  { href: "/dashboard/sultan-hub", label: "Sultan Hub", icon: Crown },
  { href: "/dashboard/khata", label: "Khata", icon: BookOpen },
  { href: "/dashboard/voice-ledger", label: "Voice Ledger", icon: Mic },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col glass-card-strong border-r border-[rgba(212,175,55,0.15)] z-40">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-[rgba(212,175,55,0.12)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#004D40] border border-[#D4AF37]/50 flex items-center justify-center gold-glow">
              <Crown className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <div className="text-base font-bold gold-text">Sultan-AI</div>
              <div className="text-xs text-[#a5c9bb]">Merchant OS</div>
            </div>
          </div>
        </div>

        {/* Merchant Info */}
        <div className="px-4 py-3 mx-3 mt-4 rounded-xl bg-[#004D40]/20 border border-[#D4AF37]/15">
          <div className="text-xs text-[#a5c9bb] mb-0.5">Active Merchant</div>
          <div className="text-sm font-semibold text-[#e8f5e9]">Ahmed Textiles</div>
          <div className="text-xs text-[#D4AF37]">Pro Plan</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-[#004D40]/60 text-[#D4AF37] border border-[#D4AF37]/30 gold-glow"
                    : "text-[#a5c9bb] hover:bg-[#004D40]/30 hover:text-[#e8f5e9]"
                )}
              >
                <item.icon className={cn("w-4 h-4", active ? "text-[#D4AF37]" : "text-[#a5c9bb]")} />
                {item.label}
                {item.href === "/dashboard/sultan-hub" && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-green-400 pulse-dot" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-[rgba(212,175,55,0.12)]">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#a5c9bb] hover:text-red-400 hover:bg-red-900/20 w-full transition-all">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="px-6 py-4 flex items-center justify-between glass-card border-b border-[rgba(212,175,55,0.12)]">
          <div>
            <h1 className="text-lg font-bold text-[#e8f5e9]">
              {navItems.find((n) => pathname === n.href || (n.href !== "/dashboard" && pathname.startsWith(n.href)))?.label ?? "Dashboard"}
            </h1>
            <p className="text-xs text-[#a5c9bb]">آج: 18 مارچ 2026</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-[#a5c9bb]">Sultan Mode</div>
              <div className="text-sm font-semibold text-green-400">Active</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#004D40] border-2 border-[#D4AF37]/50 flex items-center justify-center text-sm font-bold text-[#D4AF37]">
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
