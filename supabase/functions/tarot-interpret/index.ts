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
  focusQuestion?: string | null;
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
  return orientation === "upright" ? "Xuôi" : "Ngược";
}

function buildInterpretationCardDescriptions(drawnCards: any[]): string {
  return drawnCards
    .map((card: any, index: number) => {
      const position = typeof card?.position === "string" && card.position.trim() ? card.position.trim() : `Vị trí ${index + 1}`;
      const cardName = typeof card?.cardName === "string" && card.cardName.trim() ? card.cardName.trim() : "Lá bài không rõ tên";
      const cardMeaning = formatOrientation(card?.orientation) === "Xuôi" ? card?.uprightMeaning : card?.reversedMeaning;
      const keywords = Array.isArray(card?.keywords) ? card.keywords.filter(Boolean).join(", ") : "";

      return (
        `- ${position}: ${cardName} (${formatOrientation(card?.orientation)})\n` +
        `  Ý nghĩa cần bám sát: ${typeof cardMeaning === "string" ? cardMeaning : ""}\n` +
        `  Từ khóa: ${keywords}`
      );
    })
    .join("\n\n");
}

function buildInterpretationPrompt(spreadName: string, drawnCards: any[], focusQuestion: string): string {
  const cardDescriptions = buildInterpretationCardDescriptions(drawnCards);
  const requiredCardMentions = drawnCards
    .map((card: any, index: number) => {
      const position = typeof card?.position === "string" && card.position.trim() ? card.position.trim() : `Vị trí ${index + 1}`;
      const cardName = typeof card?.cardName === "string" && card.cardName.trim() ? card.cardName.trim() : "Lá bài không rõ tên";
      return `- ${position}: ${cardName}`;
    })
    .join("\n");

  return (
    `Hãy luận giải trải bài Tarot "${spreadName}" với dữ liệu sau:\n\n${cardDescriptions}\n\n` +
    (focusQuestion ? `Câu hỏi tập trung của người dùng:\n"${focusQuestion}"\n\n` : "") +
    "Yêu cầu bắt buộc:\n" +
    "- Viết hoàn toàn bằng tiếng Việt có dấu tự nhiên, rõ ràng, không lỗi font.\n" +
    "- Không mở đầu bằng lời chào xã giao.\n" +
    "- Không dùng markdown, không dùng dấu **, không viết chung chung.\n" +
    "- Phải phân tích hết tất cả các lá bài và nhắc rõ tên lá bài trong từng vị trí.\n" +
    "- Sau phần phân tích của mỗi lá, phải có một dòng riêng bắt đầu bằng 'Kết luận cho lá này:'\n" +
    "- Nếu là bài ngược, chỉ rõ điểm tắc, bài học cần điều chỉnh hoặc năng lượng đang bị cản trở.\n" +
    "- Cuối cùng phải có một phần tổng kết chung cho toàn bộ trải bài.\n\n" +
    "Hãy viết đúng cấu trúc sau:\n" +
    "TỔNG QUAN NĂNG LƯỢNG\n" +
    "2-3 câu tóm tắt mạch năng lượng chính của trải bài" +
    (focusQuestion ? " và bám sát câu hỏi của người dùng.\n\n" : ".\n\n") +
    "PHÂN TÍCH TỪNG LÁ BÀI\n" +
    `Bắt buộc đi qua đầy đủ từng dòng sau:\n${requiredCardMentions}\n\n` +
    "Với mỗi lá bài, viết theo mẫu:\n" +
    "- [Vị trí] - [Tên lá bài]\n" +
    "- Phân tích: 2-4 câu giải thích rõ vì sao lá bài xuất hiện ở vị trí này.\n" +
    "- Kết luận cho lá này: 1-2 câu chốt lại thông điệp riêng của lá bài.\n\n" +
    "TỔNG KẾT CUỐI CÙNG\n" +
    "Tổng hợp toàn bộ trải bài thành một kết luận chung rõ ràng, rồi đưa ra 2-3 hướng hành động cụ thể.\n\n" +
    "Độ dài mục tiêu: khoảng 350-550 từ."
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
    if (!Array.isArray(drawnCards) || !spreadName) {
      return new Response(
        JSON.stringify({ error: "drawnCards and spreadName are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const systemPrompt =
      "Bạn là chuyên gia đọc bài Tarot giàu kinh nghiệm với bộ bài Rider-Waite. " +
      "Diễn giải bằng tiếng Việt có dấu, tự nhiên, sâu sắc và bám sát từng lá bài đã rút. " +
      "Không được bỏ sót lá nào, mỗi lá phải có phần phân tích riêng và kết luận riêng, sau đó mới tổng kết toàn bộ trải bài.";
    const userPrompt = buildInterpretationPrompt(spreadName, drawnCards, focusQuestion);

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
