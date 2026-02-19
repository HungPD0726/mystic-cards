import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { drawnCards, spreadName } = await req.json();

    // Build card descriptions for the prompt
    const cardDescriptions = drawnCards
      .map(
        (dc: any) =>
          `- Vị trí "${dc.position}": ${dc.cardName} (${
            dc.orientation === "upright" ? "Xuôi" : "Ngược"
          })\n  Ý nghĩa: ${
            dc.orientation === "upright" ? dc.uprightMeaning : dc.reversedMeaning
          }\n  Từ khóa: ${dc.keywords?.join(", ")}`
      )
      .join("\n\n");

    const systemPrompt = `Bạn là một chuyên gia đọc bài Tarot với nhiều năm kinh nghiệm, am hiểu sâu sắc về hệ thống Rider-Waite Tarot và văn hóa phương Đông. Bạn diễn giải bài Tarot bằng tiếng Việt với văn phong huyền bí, ấm áp và đầy cảm hứng. Luận giải của bạn ngắn gọn (3-4 đoạn), sâu sắc và thực tế.`;

    const userPrompt = `Hãy luận giải trải bài Tarot "${spreadName}" với các lá bài sau:\n\n${cardDescriptions}\n\nVui lòng:\n1. Phân tích tổng thể năng lượng của trải bài\n2. Diễn giải ý nghĩa từng lá bài theo vị trí\n3. Đưa ra thông điệp tổng hợp và lời khuyên thiết thực\n\nViết bằng tiếng Việt, văn phong huyền bí nhưng dễ hiểu, khoảng 200-300 từ.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 1024,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("AI Gateway error:", response.status, text);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Quá nhiều yêu cầu, vui lòng thử lại sau." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Hết lượt AI, vui lòng nạp thêm credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const interpretation =
      data.choices?.[0]?.message?.content || "Không thể tạo luận giải.";

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
      }
    );
  }
});
