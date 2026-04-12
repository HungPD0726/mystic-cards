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

type ClarificationAnswer = {
  questionText?: string;
  answer?: string;
};

type ChatReadingContext = {
  spreadName?: string;
  interpretation?: string;
  focusQuestion?: string | null;
  clarificationAnswers?: ClarificationAnswer[];
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
      temperature: 0.7,
      maxOutputTokens: 1536,
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

function formatOrientation(orientation: unknown): string {
  return orientation === "upright" ? "Xuoi" : "Nguoc";
}

function formatClarificationAnswer(answer: unknown): string {
  if (answer === "yes") {
    return "Co";
  }

  if (answer === "no") {
    return "Khong";
  }

  return "Bo qua";
}

function buildInterpretationCardDescriptions(drawnCards: any[]): string {
  return drawnCards
    .map((card: any, index: number) => {
      const position = typeof card?.position === "string" && card.position.trim() ? card.position.trim() : `Vi tri ${index + 1}`;
      const cardName = typeof card?.cardName === "string" && card.cardName.trim() ? card.cardName.trim() : "La bai khong ro ten";
      const cardMeaning = formatOrientation(card?.orientation) === "Xuoi" ? card?.uprightMeaning : card?.reversedMeaning;
      const keywords = Array.isArray(card?.keywords) ? card.keywords.filter(Boolean).join(", ") : "";

      return (
        `- ${position}: ${cardName} (${formatOrientation(card?.orientation)})\n` +
        `  Y nghia can bam sat: ${typeof cardMeaning === "string" ? cardMeaning : ""}\n` +
        `  Tu khoa: ${keywords}`
      );
    })
    .join("\n\n");
}

function buildClarificationContext(clarificationAnswers: ClarificationAnswer[]): string {
  const entries = clarificationAnswers
    .map((item) => {
      const questionText =
        typeof item?.questionText === "string" && item.questionText.trim()
          ? item.questionText.trim()
          : "";

      if (!questionText) {
        return "";
      }

      return `- ${questionText}: ${formatClarificationAnswer(item.answer)}`;
    })
    .filter(Boolean)
    .join("\n");

  if (!entries) {
    return "";
  }

  return `Tin hieu bo sung tu nguoi dung:\n${entries}\n\n`;
}

function buildInterpretationPrompt(
  spreadName: string,
  drawnCards: any[],
  focusQuestion: string,
  clarificationAnswers: ClarificationAnswer[],
): string {
  const cardDescriptions = buildInterpretationCardDescriptions(drawnCards);
  const requiredCardMentions = drawnCards
    .map((card: any, index: number) => {
      const position = typeof card?.position === "string" && card.position.trim() ? card.position.trim() : `Vi tri ${index + 1}`;
      const cardName = typeof card?.cardName === "string" && card.cardName.trim() ? card.cardName.trim() : "La bai khong ro ten";
      return `- ${position}: ${cardName}`;
    })
    .join("\n");
  const clarificationContext = buildClarificationContext(clarificationAnswers);

  return (
    `Hay luan giai trai bai Tarot "${spreadName}" voi du lieu sau:\n\n${cardDescriptions}\n\n` +
    (focusQuestion ? `Cau hoi tap trung cua nguoi dung:\n"${focusQuestion}"\n\n` : "") +
    clarificationContext +
    "Yeu cau bat buoc:\n" +
    "- Viet hoan toan bang tieng Viet co dau tu nhien, ro rang, khong loi font.\n" +
    "- Khong mo dau bang loi chao xa giao.\n" +
    "- Khong dung markdown, khong dung dau **, khong viet chung chung.\n" +
    "- Phai phan tich het tat ca cac la bai va nhac ro ten la bai trong tung vi tri.\n" +
    "- Sau phan phan tich cua moi la, phai co mot dong rieng bat dau bang 'Ket luan cho la nay:'.\n" +
    "- Neu la bai nguoc, chi ro diem tac, bai hoc can dieu chinh hoac nang luong dang bi can tro.\n" +
    "- Cuoi cung phai co mot phan tong ket chung cho toan bo trai bai.\n\n" +
    "Hay viet dung cau truc sau:\n" +
    "TONG QUAN NANG LUONG\n" +
    "2-3 cau tom tat mach nang luong chinh cua trai bai" +
    (focusQuestion ? " va bam sat cau hoi cua nguoi dung.\n\n" : ".\n\n") +
    "PHAN TICH TUNG LA BAI\n" +
    `Bat buoc di qua day du tung dong sau:\n${requiredCardMentions}\n\n` +
    "Voi moi la bai, viet theo mau:\n" +
    "- [Vi tri] - [Ten la bai]\n" +
    "- Phan tich: 2-4 cau giai thich ro vi sao la bai xuat hien o vi tri nay.\n" +
    "- Ket luan cho la nay: 1-2 cau chot lai thong diep rieng cua la bai.\n\n" +
    "TONG KET CUOI CUNG\n" +
    "Tong hop toan bo trai bai thanh mot ket luan chung ro rang, roi dua ra 2-3 huong hanh dong cu the.\n\n" +
    "Do dai muc tieu: khoang 350-550 tu."
  );
}

function buildChatReadingContextPrompt(readingContext: ChatReadingContext | undefined): string {
  if (!readingContext) {
    return "";
  }

  const spreadName = typeof readingContext.spreadName === "string" ? readingContext.spreadName.trim() : "";
  const interpretation = typeof readingContext.interpretation === "string" ? readingContext.interpretation.trim() : "";
  const focusQuestion =
    typeof readingContext.focusQuestion === "string" ? readingContext.focusQuestion.trim() : "";
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
  const clarificationAnswers = Array.isArray(readingContext.clarificationAnswers)
    ? readingContext.clarificationAnswers
        .map((item) => {
          const questionText =
            typeof item?.questionText === "string" && item.questionText.trim()
              ? item.questionText.trim()
              : "";

          if (!questionText) {
            return "";
          }

          return `- ${questionText}: ${formatClarificationAnswer(item.answer)}`;
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

  if (focusQuestion) {
    sections.push(`Cau hoi tap trung cua nguoi dung:\n${focusQuestion}`);
  }

  if (clarificationAnswers.length > 0) {
    sections.push(`Tin hieu bo sung:\n${clarificationAnswers.join("\n")}`);
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
    const focusQuestion = typeof payload?.focusQuestion === "string" ? payload.focusQuestion.trim() : "";
    const clarificationAnswers = Array.isArray(payload?.clarificationAnswers) ? payload.clarificationAnswers : [];
    if (!Array.isArray(drawnCards) || !spreadName) {
      return new Response(
        JSON.stringify({ error: "drawnCards and spreadName are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const systemPrompt =
      "Ban la chuyen gia doc bai Tarot giau kinh nghiem voi bo bai Rider-Waite. " +
      "Dien giai bang tieng Viet co dau, tu nhien, sau sac va bam sat tung la bai da rut. " +
      "Khong duoc bo sot la nao, moi la phai co phan phan tich rieng va ket luan rieng, sau do moi tong ket toan bo trai bai.";
    const userPrompt = buildInterpretationPrompt(spreadName, drawnCards, focusQuestion, clarificationAnswers);

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

