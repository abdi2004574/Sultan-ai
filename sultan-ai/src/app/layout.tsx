import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Sultan-AI | Sovereign OS for Pakistani Merchants",
  description: "AI-powered B2B SaaS platform for Pakistani retail merchants. Khata management, WhatsApp automation, and smart negotiations.",
  keywords: ["Pakistan", "merchant", "B2B", "SaaS", "khata", "WhatsApp", "AI"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ur" dir="ltr">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
