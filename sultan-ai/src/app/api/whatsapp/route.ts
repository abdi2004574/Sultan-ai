import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json({ status: "ignored" });
    }

    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const messages = change.value?.messages ?? [];
        for (const message of messages) {
          await processIncomingMessage(message, change.value);
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("[WhatsApp Webhook Error]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function processIncomingMessage(message: WAMessage, context: WAContext) {
  const customerPhone = message.from;
  const messageText = message.text?.body ?? "";
  const messageType = message.type;

  const detectedLanguage = detectLanguage(messageText);
  const isNegotiation = detectNegotiationIntent(messageText);

  console.log(`[WhatsApp] From: ${customerPhone} | Lang: ${detectedLanguage} | Negotiation: ${isNegotiation}`);
  console.log(`[WhatsApp] Message: ${messageText}`);

  if (isNegotiation) {
    await handleNegotiationFlow(customerPhone, messageText, context);
  } else {
    await handleGeneralMessage(customerPhone, messageText, messageType, context);
  }
}

function detectLanguage(text: string): "roman_urdu" | "urdu" | "english" | "mixed" {
  const urduScript = /[\u0600-\u06FF]/;
  const englishWords = /\b(the|is|are|was|were|have|has|had|will|would|can|could)\b/i;
  const romanUrduPatterns = /\b(hai|hain|nahi|karo|karna|mujhe|aap|bhai|yaar|theek|achha|shukriya|zaroor|bilkul|jana|aya|gaya)\b/i;

  if (urduScript.test(text)) return "urdu";
  if (romanUrduPatterns.test(text)) return "roman_urdu";
  if (englishWords.test(text)) return "english";
  return "mixed";
}

function detectNegotiationIntent(text: string): boolean {
  const negotiationPatterns = [
    /discount/i,
    /kam karo/i,
    /price kam/i,
    /mehenga/i,
    /sasta/i,
    /bargain/i,
    /\d+%/,
    /doosri dukaan/i,
    /warna/i,
    /chhoot/i,
    /concession/i,
  ];
  return negotiationPatterns.some((p) => p.test(text));
}

async function handleNegotiationFlow(phone: string, message: string, context: WAContext) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai-negotiate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, message, merchantId: context.metadata?.phone_number_id }),
  });

  const data = await response.json();
  if (data.reply) {
    await sendWhatsAppMessage(phone, data.reply);
  }
}

async function handleGeneralMessage(phone: string, message: string, type: string, context: WAContext) {
  console.log(`[WhatsApp] General message from ${phone}: ${message} (type: ${type})`);
}

async function sendWhatsAppMessage(to: string, text: string) {
  const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    }),
  });
}

interface WAMessage {
  from: string;
  id: string;
  type: string;
  text?: { body: string };
  audio?: { id: string };
  timestamp: string;
}

interface WAContext {
  metadata?: { phone_number_id: string; display_phone_number: string };
  messages?: WAMessage[];
}
