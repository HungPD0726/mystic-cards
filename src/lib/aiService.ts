import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/integrations/supabase/client';

const EDGE_FUNCTION_NAME = 'tarot-interpret';
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL;
const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const DEFAULT_GEMINI_MODELS = [
  GEMINI_MODEL,
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro-latest',
].filter((name): name is string => !!name);

let geminiModelCandidatesPromise: Promise<string[]> | null = null;

export interface DrawnCardForAI {
  cardName: string;
  orientation: string;
  position: string;
  uprightMeaning: string;
  reversedMeaning: string;
  keywords?: string[];
}

export interface ChatApiMessage {
  role: 'user' | 'assistant';
  content: string;
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error';
}

function dedupeModels(models: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  models.forEach((model) => {
    const normalized = model.replace(/^models\//, '').trim();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    result.push(normalized);
  });

  return result;
}

async function fetchAvailableGeminiModels(): Promise<string[]> {
  if (!GEMINI_API_KEY) return [];

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`List models failed (${response.status})`);
  }

  const payload = await response.json();
  const models = Array.isArray(payload?.models) ? payload.models : [];

  const generateContentModels = models
    .filter((item: any) => Array.isArray(item?.supportedGenerationMethods) && item.supportedGenerationMethods.includes('generateContent'))
    .map((item: any) => String(item?.name ?? '').replace(/^models\//, ''))
    .filter(Boolean);

  return generateContentModels;
}

async function getGeminiModelCandidates(): Promise<string[]> {
  if (!geminiModelCandidatesPromise) {
    geminiModelCandidatesPromise = (async () => {
      try {
        const availableModels = await fetchAvailableGeminiModels();
        const merged = dedupeModels([...DEFAULT_GEMINI_MODELS, ...availableModels]);
        return merged.slice(0, 12);
      } catch (error) {
        console.warn('Unable to fetch Gemini model list, using defaults:', error);
        return dedupeModels(DEFAULT_GEMINI_MODELS);
      }
    })();
  }

  return geminiModelCandidatesPromise;
}

function getGeminiClient() {
  if (!GEMINI_API_KEY) {
    throw new Error('Missing VITE_GOOGLE_API_KEY');
  }
  return new GoogleGenerativeAI(GEMINI_API_KEY);
}

async function generateWithGeminiPrompt(prompt: string): Promise<string> {
  const client = getGeminiClient();
  const candidates = await getGeminiModelCandidates();
  const errors: string[] = [];

  for (const modelName of candidates) {
    try {
      const model = client.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      if (!text) {
        errors.push(`${modelName}: empty response`);
        continue;
      }

      return text;
    } catch (error) {
      errors.push(`${modelName}: ${extractErrorMessage(error)}`);
    }
  }

  const compactErrors = errors.slice(0, 4).join(' | ');
  throw new Error(`Gemini model fallback failed. ${compactErrors}`);
}

async function generateInterpretationWithEdgeFunction(drawnCards: DrawnCardForAI[], spreadName: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke(EDGE_FUNCTION_NAME, {
    body: { drawnCards, spreadName },
  });

  if (error) {
    throw error;
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  const interpretation = typeof data?.interpretation === 'string' ? data.interpretation.trim() : '';
  if (!interpretation) {
    throw new Error('Edge function returned empty interpretation');
  }

  return interpretation;
}

async function generateInterpretationWithGemini(drawnCards: DrawnCardForAI[], spreadName: string): Promise<string> {
  const cardDescriptions = drawnCards
    .map(
      (dc) =>
        `- Vị trí "${dc.position}": ${dc.cardName} (${dc.orientation === 'upright' ? 'Xuôi' : 'Ngược'})\n` +
        `  Ý nghĩa: ${dc.orientation === 'upright' ? dc.uprightMeaning : dc.reversedMeaning}\n` +
        `  Từ khóa: ${dc.keywords?.join(', ') ?? ''}`,
    )
    .join('\n\n');

  const prompt =
    `Bạn là chuyên gia Tarot Rider-Waite.\n` +
    `Hãy luận giải trải bài "${spreadName}" với dữ liệu sau:\n\n${cardDescriptions}\n\n` +
    `Yêu cầu:\n` +
    `1. Phân tích năng lượng tổng thể.\n` +
    `2. Giải nghĩa từng lá theo vị trí.\n` +
    `3. Đưa ra thông điệp kết luận và gợi ý hành động ngắn gọn.\n\n` +
    `Viết bằng tiếng Việt, rõ ràng, dễ hiểu, khoảng 180-260 từ.`;

  return generateWithGeminiPrompt(prompt);
}

async function generateChatReplyWithEdgeFunction(messages: ChatApiMessage[]): Promise<string> {
  const { data, error } = await supabase.functions.invoke(EDGE_FUNCTION_NAME, {
    body: {
      mode: 'chat',
      messages,
    },
  });

  if (error) {
    throw error;
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  const reply = typeof data?.reply === 'string' ? data.reply.trim() : '';
  if (!reply) {
    throw new Error('Edge function returned empty reply');
  }

  return reply;
}

async function generateChatReplyWithGemini(messages: ChatApiMessage[]): Promise<string> {
  const recentMessages = messages.slice(-16);
  const transcript = recentMessages
    .map((message) => `${message.role === 'user' ? 'Người dùng' : 'Trợ lý'}: ${message.content}`)
    .join('\n');

  const prompt =
    `Bạn là trợ lý Tarot thân thiện, thực tế và giàu đồng cảm.\n` +
    `Hãy trả lời bằng tiếng Việt ngắn gọn, rõ ràng, tránh giáo điều.\n` +
    `Dưới đây là hội thoại gần đây:\n${transcript}\n\n` +
    `Hãy trả lời tin nhắn cuối của người dùng. Nếu câu hỏi mơ hồ, hãy gợi ý cách đặt câu hỏi Tarot tốt hơn.`;

  return generateWithGeminiPrompt(prompt);
}

export async function generateTarotInterpretationAI(
  drawnCards: DrawnCardForAI[],
  spreadName: string,
): Promise<string> {
  let edgeError: unknown;

  try {
    return await generateInterpretationWithEdgeFunction(drawnCards, spreadName);
  } catch (error) {
    edgeError = error;
    console.warn('AI interpretation edge function failed, falling back to Gemini:', error);
  }

  try {
    return await generateInterpretationWithGemini(drawnCards, spreadName);
  } catch (fallbackError) {
    const edgeMessage = extractErrorMessage(edgeError);
    const fallbackMessage = extractErrorMessage(fallbackError);
    throw new Error(`Không thể tạo luận giải AI. Edge: ${edgeMessage}. Gemini: ${fallbackMessage}.`);
  }
}

export async function generateTarotChatReplyAI(messages: ChatApiMessage[]): Promise<string> {
  let edgeError: unknown;

  try {
    return await generateChatReplyWithEdgeFunction(messages);
  } catch (error) {
    edgeError = error;
    console.warn('Chat edge function failed, falling back to Gemini:', error);
  }

  try {
    return await generateChatReplyWithGemini(messages);
  } catch (fallbackError) {
    const edgeMessage = extractErrorMessage(edgeError);
    const fallbackMessage = extractErrorMessage(fallbackError);
    throw new Error(`Không thể tạo phản hồi AI. Edge: ${edgeMessage}. Gemini: ${fallbackMessage}.`);
  }
}
