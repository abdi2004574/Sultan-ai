import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "placeholder" });
}
function getGenAI() {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "placeholder");
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const merchantId = formData.get("merchantId") as string;
    const textInput = formData.get("text") as string | null;

    let transcribedText = textInput ?? "";

    if (audioFile) {
      const transcription = await getOpenAI().audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        language: "ur",
        prompt: "Pakistani merchant ledger entry in Roman Urdu or Urdu. Include customer name, amount, transaction type.",
      });
      transcribedText = transcription.text;
    }

    if (!transcribedText) {
      return NextResponse.json({ error: "No audio or text provided" }, { status: 400 });
    }

    const ledgerEntry = await convertToLedgerEntry(transcribedText);

    return NextResponse.json({
      success: true,
      transcription: transcribedText,
      ledgerEntry,
    });
  } catch (err) {
    console.error("[Voice Ledger Error]", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

async function convertToLedgerEntry(transcript: string): Promise<LedgerEntry> {
  const model = getGenAI().getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `Tum ek Pakistani merchant ledger (khata) entry extractor ho.

Yeh voice transcript hai: "${transcript}"

Isse ek structured JSON ledger entry mein convert karo with these fields:
- customerName: string (customer ka naam)
- customerPhone: string | null (agar mention ho)
- amount: number (PKR mein, sirf number)
- type: "credit" | "debit" | "payment" (credit = merchant ne diya/udhar, debit = customer ne liya/udhar, payment = payment received)
- description: string (kya hua brief mein)
- dueDate: string | null (ISO date format agar mention ho)

ONLY return valid JSON, no explanation.
Example: {"customerName":"Rana Bhai","customerPhone":null,"amount":5000,"type":"debit","description":"2 pieces lawn suit udhar diya","dueDate":null}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as LedgerEntry;
    }
  } catch {
    console.error("[Voice Ledger] JSON parse failed", text);
  }

  return {
    customerName: "Unknown",
    customerPhone: null,
    amount: 0,
    type: "debit",
    description: transcript,
    dueDate: null,
  };
}

interface LedgerEntry {
  customerName: string;
  customerPhone: string | null;
  amount: number;
  type: "credit" | "debit" | "payment";
  description: string;
  dueDate: string | null;
}
