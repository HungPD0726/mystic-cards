import { describe, expect, it, vi } from 'vitest';
import { tryProviders } from '../../supabase/functions/tarot-interpret/providerUtils';

const messages = [{ role: 'user', content: 'Hello' }];

describe('providerUtils', () => {
  it('falls back to the next provider when an earlier provider fails', async () => {
    const firstProvider = vi.fn().mockResolvedValue({
      error: 'Qua nhieu yeu cau',
      status: 429,
    });
    const secondProvider = vi.fn().mockResolvedValue({
      data: { reply: 'success' },
      status: 200,
    });

    const result = await tryProviders([firstProvider, secondProvider], messages);

    expect(firstProvider).toHaveBeenCalledWith(messages);
    expect(secondProvider).toHaveBeenCalledWith(messages);
    expect(result).toEqual({
      data: { reply: 'success' },
      status: 200,
    });
  });

  it('preserves a 429 status when all providers fail with rate-limit style errors', async () => {
    const result = await tryProviders(
      [
        vi.fn().mockResolvedValue({ error: 'Gateway error', status: 500 }),
        vi.fn().mockResolvedValue({ error: 'Qua nhieu yeu cau', status: 429 }),
      ],
      messages,
    );

    expect(result.status).toBe(429);
    expect(result.error).toContain('Qua nhieu yeu cau');
  });

  it('preserves a 402 status when all providers fail with quota errors', async () => {
    const result = await tryProviders(
      [
        vi.fn().mockResolvedValue({ error: 'Het luot AI', status: 402 }),
        vi.fn().mockResolvedValue({ error: 'Provider error', status: 500 }),
      ],
      messages,
    );

    expect(result.status).toBe(402);
    expect(result.error).toContain('Het luot AI');
  });
});
