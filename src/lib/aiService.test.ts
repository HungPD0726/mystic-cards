import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generateTarotInterpretationAI } from './aiService';

const invokeMock = vi.hoisted(() => vi.fn());

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: invokeMock,
    },
  },
}));

describe('aiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps legacy AI Gateway 401 responses to a friendly LOVABLE secret error', async () => {
    invokeMock.mockResolvedValue({
      data: null,
      error: {
        message: 'Edge Function returned a non-2xx status code',
        context: new Response(JSON.stringify({ error: 'AI Gateway error: 401' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      },
    });

    await expect(
      generateTarotInterpretationAI(
        [
          {
            cardName: 'The Fool',
            orientation: 'upright',
            position: 'Hien tai',
            uprightMeaning: 'Khoi dau moi',
            reversedMeaning: 'Thieu chuan bi',
          },
        ],
        'Mot la',
      ),
    ).rejects.toThrow('Cap nhat LOVABLE_API_KEY trong Supabase secrets.');
  });
});
