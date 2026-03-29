import { supabase } from '@/integrations/supabase/client';

const EDGE_FUNCTION_NAME = 'tarot-interpret';

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

export interface ChatReadingContext {
  spreadName: string;
  interpretation: string;
  focusQuestion?: string | null;
  drawnCards: DrawnCardForAI[];
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

async function readEdgeFunctionBody(error: unknown): Promise<string> {
  const response = (error as { context?: Response })?.context;
  if (!(response instanceof Response)) {
    return '';
  }

  try {
    const clonedResponse = response.clone();
    const contentType = clonedResponse.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
      const payload = await clonedResponse.json();
      if (typeof payload?.error === 'string') {
        return payload.error.trim();
      }
      if (typeof payload?.message === 'string') {
        return payload.message.trim();
      }
    }

    const rawText = (await clonedResponse.text()).trim();
    if (!rawText) {
      return '';
    }

    try {
      const payload = JSON.parse(rawText);
      if (typeof payload?.error === 'string') {
        return payload.error.trim();
      }
      if (typeof payload?.message === 'string') {
        return payload.message.trim();
      }
    } catch {
      return rawText;
    }

    return rawText;
  } catch {
    return '';
  }
}

function buildAiCredentialsError(normalizedMessage: string): Error | null {
  const mentionsGoogleCredentials =
    normalizedMessage.includes('google_api_key') ||
    normalizedMessage.includes('gemini error: 401') ||
    (normalizedMessage.includes('gemini') && normalizedMessage.includes('credentials are invalid'));
  const mentionsLovableCredentials =
    normalizedMessage.includes('lovable_api_key') ||
    normalizedMessage.includes('ai gateway error: 401') ||
    (normalizedMessage.includes('ai gateway') && normalizedMessage.includes('credentials are invalid'));

  if (mentionsGoogleCredentials && mentionsLovableCredentials) {
    return new Error(
      'Dich vu AI tren server dang bi tu choi xac thuc. Cap nhat GOOGLE_API_KEY hoac LOVABLE_API_KEY trong Supabase secrets.',
    );
  }

  if (mentionsGoogleCredentials) {
    return new Error('Dich vu AI tren server dang bi tu choi xac thuc. Cap nhat GOOGLE_API_KEY trong Supabase secrets.');
  }

  if (mentionsLovableCredentials) {
    return new Error('Dich vu AI tren server dang bi tu choi xac thuc. Cap nhat LOVABLE_API_KEY trong Supabase secrets.');
  }

  if (
    normalizedMessage.includes('not configured') ||
    normalizedMessage.includes('credentials are invalid')
  ) {
    return new Error(
      'Dich vu AI tren server chua duoc cau hinh dung. Cap nhat GOOGLE_API_KEY hoac LOVABLE_API_KEY trong Supabase secrets.',
    );
  }

  return null;
}

function normalizeAiInterpretationText(text: string): string {
  return text
    .replace(/\bTONG QUAN NANG LUONG\b/g, 'TỔNG QUAN NĂNG LƯỢNG')
    .replace(/\bPHAN TICH TUNG VI TRI\b/g, 'PHÂN TÍCH TỪNG LÁ BÀI')
    .replace(/\bKET LUAN TUNG LA\b/g, 'KẾT LUẬN TỪNG LÁ')
    .replace(/\bTONG KET CUOI CUNG\b/g, 'TỔNG KẾT CUỐI CÙNG')
    .replace(/\bTHONG DIEP VA HANH DONG GOI Y\b/g, 'THÔNG ĐIỆP VÀ HÀNH ĐỘNG GỢI Ý')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function buildAiError(error: unknown, action: string): Promise<Error> {
  const rawMessage = extractErrorMessage(error);
  const edgeMessage = await readEdgeFunctionBody(error);
  const message = edgeMessage || rawMessage;
  const normalized = message.toLowerCase();

  const credentialsError = buildAiCredentialsError(normalized);
  if (credentialsError) {
    return credentialsError;
  }

  if (normalized.includes('reported as leaked') || normalized.includes('blocked because it was reported as leaked')) {
    return new Error('Google API key cu da bi khoa do leak. Tao key moi va luu vao Supabase secrets.');
  }

  if (normalized.includes('failed to fetch') || normalized.includes('network')) {
    return new Error('Khong the ket noi toi Supabase Edge Function cho AI. Vui long thu lai sau.');
  }

  if (edgeMessage) {
    return new Error(`Khong the ${action}. ${edgeMessage}`);
  }

  return new Error(`Khong the ${action}. ${rawMessage}`);
}

async function invokeTarotFunction(
  body: Record<string, unknown>,
  resultKey: 'interpretation' | 'reply',
  emptyMessage: string,
): Promise<string> {
  const { data, error } = await supabase.functions.invoke(EDGE_FUNCTION_NAME, {
    body,
  });

  if (error) {
    throw error;
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  const result = typeof data?.[resultKey] === 'string' ? data[resultKey].trim() : '';
  if (!result) {
    throw new Error(emptyMessage);
  }

  return result;
}

export async function generateTarotInterpretationAI(
  drawnCards: DrawnCardForAI[],
  spreadName: string,
  focusQuestion?: string | null,
): Promise<string> {
  try {
    const interpretation = await invokeTarotFunction(
      { drawnCards, spreadName, focusQuestion },
      'interpretation',
      'Edge function returned empty interpretation',
    );

    return normalizeAiInterpretationText(interpretation);
  } catch (error) {
    throw await buildAiError(error, 'tao luan giai AI');
  }
}

export async function generateTarotChatReplyAI(
  messages: ChatApiMessage[],
  readingContext?: ChatReadingContext,
): Promise<string> {
  try {
    return await invokeTarotFunction(
      {
        mode: 'chat',
        messages,
        readingContext,
      },
      'reply',
      'Edge function returned empty reply',
    );
  } catch (error) {
    throw await buildAiError(error, 'tao phan hoi AI');
  }
}
