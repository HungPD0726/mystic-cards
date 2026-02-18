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

    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    if (!GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY is not configured");
    }

    // Build card descriptions for the prompt
    const cardDescriptions = drawnCards
      .map(
        (dc: any, i: number) =>
          `- Vị trí "${dc.position}": ${dc.cardName} (${
            dc.orientation === "upright" ? "Xuôi" : "Ngược"
          })\n  Ý nghĩa: ${
            dc.orientation === "upright" ? dc.uprightMeaning : dc.reversedMeaning
          }\n  Từ khóa: ${dc.keywords?.join(", ")}`
      )
      .join("\n\n");

    const systemPrompt = `Bạn là một chuyên gia đọc bài Tarot với nhiều năm kinh nghiệm, am hiểu sâu sắc về hệ thống Rider-Waite Tarot và văn hóa phương Đông. Bạn diễn giải bài Tarot bằng tiếng Việt với văn phong huyền bí, ấm áp và đầy cảm hứng. Luận giải của bạn ngắn gọn (3-4 đoạn), sâu sắc và thực tế.`;

    const userPrompt = `Hãy luận giải trải bài Tarot "${spreadName}" với các lá bài sau:\n\n${cardDescriptions}\n\nVui lòng:\n1. Phân tích tổng thể năng lượng của trải bài\n2. Diễn giải ý nghĩa từng lá bài theo vị trí\n3. Đưa ra thông điệp tổng hợp và lời khuyên thiết thực\n\nViết bằng tiếng Việt, văn phong huyền bí nhưng dễ hiểu, khoảng 200-300 từ.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: systemPrompt + "\n\n" + userPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Quá nhiều yêu cầu, vui lòng thử lại sau." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const text = await response.text();
      console.error("Google Gemini API error:", response.status, text);
      throw new Error(`Google Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const interpretation =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "Không thể tạo luận giải.";

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
