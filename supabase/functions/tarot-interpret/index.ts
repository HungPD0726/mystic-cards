import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODEL = "google/gemini-2.5-flash";

type ChatInputMessage = {
  role: "user" | "assistant";
  content: string;
};

async function callAiGateway(messages: Array<{ role: string; content: string }>) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 1024,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("AI Gateway error:", response.status, text);

    if (response.status === 429) {
      return { error: "Qua nhieu yeu cau, vui long thu lai sau.", status: 429 };
    }

    if (response.status === 402) {
      return { error: "Het luot AI, vui long nap them credits.", status: 402 };
    }

    return { error: `AI Gateway error: ${response.status}`, status: 500 };
  }

  const data = await response.json();
  return { data, status: 200 };
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
        .filter((msg) => msg?.role && typeof msg?.content === "string" && msg.content.trim())
        .slice(-20)
        .map((msg) => ({
          role: msg.role,
          content: msg.content.trim(),
        }));

      const systemPrompt =
        "Ban la tro ly Tarot thong thai, am ap va than thien. " +
        "Tra loi bang tieng Viet ngan gon, ro rang, huu ich. " +
        "Neu nguoi dung hoi ve Tarot, hay dua ra giai thich va loi khuyen thuc te.";

      const result = await callAiGateway([
        { role: "system", content: systemPrompt },
        ...sanitizedMessages,
      ]);

      if (result.error) {
        return new Response(
          JSON.stringify({ error: result.error }),
          { status: result.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const reply = result.data?.choices?.[0]?.message?.content || "Khong the tao phan hoi.";

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
        (dc: any) =>
          `- Vi tri "${dc.position}": ${dc.cardName} (${dc.orientation === "upright" ? "Xuoi" : "Nguoc"})\n` +
          `  Y nghia: ${dc.orientation === "upright" ? dc.uprightMeaning : dc.reversedMeaning}\n` +
          `  Tu khoa: ${dc.keywords?.join(", ") ?? ""}`,
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

    const result = await callAiGateway([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    if (result.error) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: result.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const interpretation =
      result.data?.choices?.[0]?.message?.content || "Khong the tao luan giai.";

    return new Response(JSON.stringify({ interpretation }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("tarot-interpret error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
