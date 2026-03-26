import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildProviderError, ProviderMessage, ProviderResult, tryProviders } from "./providerUtils.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_MODEL = Deno.env.get("LOVABLE_MODEL") ?? "google/gemini-2.5-flash";
const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";

type ChatInputMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatReadingContext = {
  spreadName?: string;
  interpretation?: string;
  drawnCards?: Array<{
    cardName?: string;
    orientation?: string;
    position?: string;
  }>;
};

function extractGeminiText(data: any): string {
  const candidates = Array.isArray(data?.candidates) ? data.candidates : [];

  for (const candidate of candidates) {
    const parts = Array.isArray(candidate?.content?.parts) ? candidate.content.parts : [];
    const text = parts
      .map((part: any) => (typeof part?.text === "string" ? part.text : ""))
      .join("")
      .trim();

    if (text) {
      return text;
    }
  }

  return "";
}

async function callGemini(messages: ProviderMessage[]): Promise<ProviderResult> {
  const apiKey = Deno.env.get("GOOGLE_API_KEY");
  if (!apiKey) {
    return { error: "GOOGLE_API_KEY is not configured", status: 500 };
  }

  const systemInstruction = messages
    .filter((message) => message.role === "system" && message.content.trim())
    .map((message) => message.content.trim())
    .join("\n\n");

  const contents = messages
    .filter((message) => message.role !== "system" && message.content.trim())
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content.trim() }],
    }));

  if (contents.length === 0) {
    return { error: "Gemini request is missing input messages.", status: 400 };
  }

  const payload: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 1024,
    },
  };

  if (systemInstruction) {
    payload.system_instruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Gemini API error:", response.status, text);
    return buildProviderError("Gemini", response.status, text);
  }

  const data = await response.json();
  return { data, status: 200 };
}

async function callAiGateway(messages: ProviderMessage[]): Promise<ProviderResult> {
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableApiKey) {
    return { error: "LOVABLE_API_KEY is not configured", status: 500 };
  }

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableApiKey}`,
    },
    body: JSON.stringify({
      model: LOVABLE_MODEL,
      messages,
      max_tokens: 1024,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("AI Gateway error:", response.status, text);
    return buildProviderError("AI Gateway", response.status, text);
  }

  const data = await response.json();
  return { data, status: 200 };
}

async function callAiProvider(messages: ProviderMessage[]): Promise<ProviderResult> {
  const availableProviders = [
    Deno.env.get("GOOGLE_API_KEY") ? callGemini : null,
    Deno.env.get("LOVABLE_API_KEY") ? callAiGateway : null,
  ].filter((provider): provider is typeof callGemini => provider !== null);

  return tryProviders(availableProviders, messages);
}

function extractGatewayText(data: any): string {
  return typeof data?.choices?.[0]?.message?.content === "string"
    ? data.choices[0].message.content.trim()
    : "";
}

function extractProviderText(data: any): string {
  const geminiText = extractGeminiText(data);
  if (geminiText) {
    return geminiText;
  }

  return extractGatewayText(data);
}

function buildChatReadingContextPrompt(readingContext: ChatReadingContext | undefined): string {
  if (!readingContext) {
    return "";
  }

  const spreadName = typeof readingContext.spreadName === "string" ? readingContext.spreadName.trim() : "";
  const interpretation = typeof readingContext.interpretation === "string" ? readingContext.interpretation.trim() : "";
  const drawnCards = Array.isArray(readingContext.drawnCards)
    ? readingContext.drawnCards
        .map((card) => {
          const position = typeof card?.position === "string" ? card.position.trim() : "";
          const cardName = typeof card?.cardName === "string" ? card.cardName.trim() : "";
          const orientation = card?.orientation === "upright" ? "Xuoi" : "Nguoc";

          if (!position && !cardName) {
            return "";
          }

          return `- ${position || "Khong ro vi tri"}: ${cardName || "Khong ro ten la"} (${orientation})`;
        })
        .filter(Boolean)
    : [];

  const sections: string[] = [];

  if (spreadName) {
    sections.push(`Trai bai hien tai: ${spreadName}`);
  }

  if (drawnCards.length > 0) {
    sections.push(`Cac la bai:\n${drawnCards.join("\n")}`);
  }

  if (interpretation) {
    sections.push(`Luan giai ban dau:\n${interpretation}`);
  }

  if (sections.length === 0) {
    return "";
  }

  return (
    "\nSu dung ngu canh Tarot sau de tra loi nhat quan voi trai bai hien tai. " +
    "Khong can lap lai toan bo luan giai tru khi nguoi dung yeu cau.\n\n" +
    sections.join("\n\n")
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    if (payload?.mode === "chat") {
      const inputMessages: ChatInputMessage[] = Array.isArray(payload?.messages)
        ? payload.messages
        : [];

      if (inputMessages.length === 0) {
        return new Response(
          JSON.stringify({ error: "Chat messages are required." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const sanitizedMessages = inputMessages
        .filter((message) => message?.role && typeof message?.content === "string" && message.content.trim())
        .slice(-20)
        .map((message) => ({
          role: message.role,
          content: message.content.trim(),
        }));

      const readingContextPrompt = buildChatReadingContextPrompt(payload?.readingContext as ChatReadingContext | undefined);
      const systemPrompt =
        "Ban la tro ly Tarot thong thai, am ap va than thien. " +
        "Tra loi bang tieng Viet ngan gon, ro rang, huu ich. " +
        "Neu nguoi dung hoi ve Tarot, hay dua ra giai thich va loi khuyen thuc te." +
        readingContextPrompt;

      const result = await callAiProvider([
        { role: "system", content: systemPrompt },
        ...sanitizedMessages,
      ]);

      if (result.error) {
        return new Response(
          JSON.stringify({ error: result.error }),
          { status: result.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const reply = extractProviderText(result.data) || "Khong the tao phan hoi.";

      return new Response(JSON.stringify({ reply }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { drawnCards, spreadName } = payload;
    if (!Array.isArray(drawnCards) || !spreadName) {
      return new Response(
        JSON.stringify({ error: "drawnCards and spreadName are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const cardDescriptions = drawnCards
      .map(
        (card: any) =>
          `- Vi tri "${card.position}": ${card.cardName} (${card.orientation === "upright" ? "Xuoi" : "Nguoc"})\n` +
          `  Y nghia: ${card.orientation === "upright" ? card.uprightMeaning : card.reversedMeaning}\n` +
          `  Tu khoa: ${card.keywords?.join(", ") ?? ""}`,
      )
      .join("\n\n");

    const systemPrompt =
      "Ban la chuyen gia doc bai Tarot giau kinh nghiem voi bo bai Rider-Waite. " +
      "Dien giai bang tieng Viet huyen bi nhung de hieu, ngan gon 3-4 doan, sau sac va thuc te.";

    const userPrompt =
      `Hay luan giai trai bai Tarot "${spreadName}" voi cac la bai sau:\n\n${cardDescriptions}\n\n` +
      "Vui long:\n" +
      "1. Phan tich tong the nang luong cua trai bai\n" +
      "2. Dien giai y nghia tung la bai theo vi tri\n" +
      "3. Dua ra thong diep tong hop va loi khuyen thiet thuc\n\n" +
      "Viet bang tieng Viet, khoang 200-300 tu.";

    const result = await callAiProvider([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    if (result.error) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: result.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const interpretation = extractProviderText(result.data) || "Khong the tao luan giai.";

    return new Response(JSON.stringify({ interpretation }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("tarot-interpret error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
