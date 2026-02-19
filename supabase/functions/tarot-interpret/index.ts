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

    const prompt = `Bạn là một chuyên gia đọc bài Tarot với nhiều năm kinh nghiệm, am hiểu sâu sắc về hệ thống Rider-Waite Tarot và văn hóa phương Đông. Bạn diễn giải bài Tarot bằng tiếng Việt với văn phong huyền bí, ấm áp và đầy cảm hứng.

Hãy luận giải trải bài Tarot "${spreadName}" với các lá bài sau:

${cardDescriptions}

Vui lòng:
1. Phân tích tổng thể năng lượng của trải bài
2. Diễn giải ý nghĩa từng lá bài theo vị trí
3. Đưa ra thông điệp tổng hợp và lời khuyên thiết thực

Viết bằng tiếng Việt, văn phong huyền bí nhưng dễ hiểu, khoảng 200-300 từ.`;

    // Use Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    const response = await fetch("https://api.lovable.dev/v1/ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "user", content: prompt },
        ],
        max_tokens: 1024,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("AI Gateway error:", response.status, text);
      throw new Error(`AI Gateway error: ${response.status} ${text}`);
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
