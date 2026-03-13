const RETRY_DELAYS = [2000, 4000, 8000]; // ms — 2s, 4s, 8s

export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const status = error?.status as number | undefined;
      const retryable = status === 429 || status === 503;
      if (retryable && attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[attempt]));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}
