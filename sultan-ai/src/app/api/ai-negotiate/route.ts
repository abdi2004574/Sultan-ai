import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

function getGenAI() {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "placeholder");
}

export async function POST(req: NextRequest) {
  try {
    const { phone, message, merchantId, tone = "friendly", maxDiscountPercent = 15 } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const negotiationResult = analyzeNegotiationRequest(message);
    const guardrailResponse = applyMaxDiscountGuardrail(negotiationResult, maxDiscountPercent);

    const systemPrompt = buildSultanSystemPrompt(tone, maxDiscountPercent, guardrailResponse);
    const model = getGenAI().getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `Customer message: "${message}"\n\nGuardrail info: ${JSON.stringify(guardrailResponse)}` },
    ]);

    const reply = result.response.text();

    return NextResponse.json({
      reply,
      negotiationDetected: negotiationResult.isNegotiation,
      requestedDiscount: negotiationResult.requestedDiscount,
      offeredDiscount: guardrailResponse.offeredDiscount,
      guardrailTriggered: guardrailResponse.guardrailTriggered,
      withinLimit: guardrailResponse.withinLimit,
    });
  } catch (err) {
    console.error("[AI Negotiate Error]", err);
    return NextResponse.json({ error: "AI processing failed" }, { status: 500 });
  }
}

function analyzeNegotiationRequest(message: string): NegotiationAnalysis {
  const percentMatch = message.match(/(\d+)\s*%/);
  const requestedDiscount = percentMatch ? parseInt(percentMatch[1]) : null;

  const highPressureSignals = [
    /doosri dukaan/i,
    /warna/i,
    /chhod do/i,
    /nahi lena/i,
    /cancel/i,
  ].some((p) => p.test(message));

  return {
    isNegotiation: requestedDiscount !== null || highPressureSignals,
    requestedDiscount,
    highPressure: highPressureSignals,
  };
}

function applyMaxDiscountGuardrail(analysis: NegotiationAnalysis, maxDiscountPercent: number): GuardrailResult {
  if (!analysis.isNegotiation || analysis.requestedDiscount === null) {
    return { guardrailTriggered: false, offeredDiscount: null, withinLimit: true };
  }

  const requested = analysis.requestedDiscount;
  const guardrailTriggered = requested > maxDiscountPercent;

  const offeredDiscount = guardrailTriggered
    ? Math.min(maxDiscountPercent * 0.6, maxDiscountPercent)
    : requested;

  return {
    guardrailTriggered,
    offeredDiscount: Math.round(offeredDiscount),
    withinLimit: !guardrailTriggered,
    requestedOver: guardrailTriggered ? requested - maxDiscountPercent : 0,
  };
}

function buildSultanSystemPrompt(tone: string, maxDiscount: number, guardrail: GuardrailResult): string {
  const toneInstructions: Record<string, string> = {
    friendly: "Dost jaisa baat karo, 'bhai' ya 'jaan' use karo. Warmth dikhao lekin business sensible raho.",
    formal: "Professional aur respectful raho. 'Sahib/Baji' se address karo. Business language use karo.",
    strict: "Direct aur firm raho. Sympathetic lekin clear karo ke rules hain jo follow karne hain.",
  };

  return `Tum Sultan-AI ho — Pakistan ke ek bade textile merchant ka AI assistant.
Tum Roman Urdu mein jawab dete ho (Urdu words written in English letters).
Tone: ${toneInstructions[tone] ?? toneInstructions.friendly}

NEGOTIATION RULES (GUARDRAIL):
- Maximum discount tum de sakte ho: ${maxDiscount}%
- Guardrail triggered: ${guardrail.guardrailTriggered ? "YES" : "NO"}
- Agar guardrail triggered hai: Customer ne jo discount manga hai woh allowed nahi. Offered discount: ${guardrail.offeredDiscount}%
- KABHI BHI ${maxDiscount}% se zyada discount mat do
- Agar customer pressure deta hai, firmly lekin politely maximum limit explain karo
- Customer ki loyalty acknowledge karo
- Alternative value offer karo (fast delivery, better quality, etc.)

Response format:
- 1-3 sentences max
- Roman Urdu preferred
- Friendly but firm on guardrail
- Include specific PKR amount if relevant`;
}

interface NegotiationAnalysis {
  isNegotiation: boolean;
  requestedDiscount: number | null;
  highPressure: boolean;
}

interface GuardrailResult {
  guardrailTriggered: boolean;
  offeredDiscount: number | null;
  withinLimit: boolean;
  requestedOver?: number;
}
