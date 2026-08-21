/**
 * Exponential backoff retry helper for LLM requests.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: {
    maxAttempts?: number;
    baseDelayMs?: number;
    shouldRetry?: (err: Error) => boolean;
  }
): Promise<T> {
  const maxAttempts = options?.maxAttempts ?? 3;
  const baseDelayMs = options?.baseDelayMs ?? 1000;
  const shouldRetry = options?.shouldRetry ?? defaultShouldRetry;

  let lastError: Error = new Error('Unknown error');
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt === maxAttempts || !shouldRetry(lastError)) {
        throw lastError;
      }
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(`[RetryHelper] Attempt ${attempt} failed: ${lastError.message}. Retrying in ${delay}ms…`);
      await sleep(delay);
    }
  }
  throw lastError;
}

function defaultShouldRetry(err: Error): boolean {
  const msg = err.message.toLowerCase();
  // Retry on rate limits and server errors
  if (msg.includes('429') || msg.includes('rate limit')) return true;
  if (msg.includes('500') || msg.includes('502') || msg.includes('503') || msg.includes('504')) return true;
  if (msg.includes('network') || msg.includes('econnreset') || msg.includes('econnrefused')) return true;
  if (msg.includes('timeout')) return true;
  // Do NOT retry auth errors or bad requests
  if (msg.includes('401') || msg.includes('403') || msg.includes('unauthorized') || msg.includes('forbidden')) return false;
  if (msg.includes('400') || msg.includes('bad request') || msg.includes('invalid')) return false;
  // Retry unknown errors
  return true;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wrap a promise with a timeout.
 */
export async function withTimeout<T>(promise: Promise<T>, timeoutMs = 120_000): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`LLM request timed out after ${timeoutMs}ms`)), timeoutMs)
  );
  return Promise.race([promise, timeoutPromise]);
}
