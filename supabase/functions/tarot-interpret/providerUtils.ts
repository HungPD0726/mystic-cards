export type ProviderMessage = {
  role: string;
  content: string;
};

export type ProviderResult = {
  data?: unknown;
  error?: string;
  status: number;
};

export type ProviderCall = (messages: ProviderMessage[]) => Promise<ProviderResult>;

export function buildProviderError(provider: 'Gemini' | 'AI Gateway', status: number, bodyText: string): ProviderResult {
  const loweredBody = bodyText.toLowerCase();

  if (status === 429) {
    return { error: 'Qua nhieu yeu cau, vui long thu lai sau.', status: 429 };
  }

  if (status === 402) {
    return { error: 'Het luot AI, vui long nap them credits.', status: 402 };
  }

  if (status === 401) {
    const secretName = provider === 'Gemini' ? 'GOOGLE_API_KEY' : 'LOVABLE_API_KEY';
    return {
      error: `${secretName} credentials are invalid. Update the secret in Supabase.`,
      status: 500,
    };
  }

  if (status === 403 && loweredBody.includes('reported as leaked')) {
    return {
      error: 'Google API key is blocked because it was reported as leaked. Rotate the key and store the new one in Supabase secrets as GOOGLE_API_KEY.',
      status: 500,
    };
  }

  return { error: `${provider} error: ${status}`, status: 500 };
}

export function combineProviderFailures(results: ProviderResult[]): ProviderResult {
  const status = results.reduce((currentStatus, result) => {
    if (result.error && result.status !== 500) {
      return result.status;
    }

    return currentStatus;
  }, 500);

  return {
    error: results
      .map((result) => result.error)
      .filter((message): message is string => typeof message === 'string' && message.length > 0)
      .join(' | '),
    status,
  };
}

export async function tryProviders(
  providers: ProviderCall[],
  messages: ProviderMessage[],
): Promise<ProviderResult> {
  if (providers.length === 0) {
    return {
      error: 'AI backend is not configured. Set GOOGLE_API_KEY or LOVABLE_API_KEY in Supabase secrets.',
      status: 500,
    };
  }

  const failures: ProviderResult[] = [];

  for (const provider of providers) {
    const result = await provider(messages);
    if (!result.error) {
      return result;
    }

    failures.push(result);
  }

  return combineProviderFailures(failures);
}
