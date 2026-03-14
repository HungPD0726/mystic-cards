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

async function buildAiError(error: unknown, action: string): Promise<Error> {
  const rawMessage = extractErrorMessage(error);
  const edgeMessage = await readEdgeFunctionBody(error);
  const message = edgeMessage || rawMessage;
  const normalized = message.toLowerCase();

  if (
    normalized.includes('google_api_key') ||
    normalized.includes('lovable_api_key') ||
    normalized.includes('not configured') ||
    normalized.includes('credentials are invalid')
  ) {
    return new Error(
      'Dich vu AI tren server chua duoc cau hinh dung. Cap nhat GOOGLE_API_KEY hoac LOVABLE_API_KEY trong Supabase secrets.',
    );
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
): Promise<string> {
  try {
    return await invokeTarotFunction(
      { drawnCards, spreadName },
      'interpretation',
      'Edge function returned empty interpretation',
    );
  } catch (error) {
    throw await buildAiError(error, 'tao luan giai AI');
  }
}

export async function generateTarotChatReplyAI(messages: ChatApiMessage[]): Promise<string> {
  try {
    return await invokeTarotFunction(
      {
        mode: 'chat',
        messages,
      },
      'reply',
      'Edge function returned empty reply',
    );
  } catch (error) {
    throw await buildAiError(error, 'tao phan hoi AI');
  }
}
