// Local telemetry (formerly @saas-maker/ops). Server-side PostHog ingest for
// CF Workers (no SDK — raw /capture/ HTTPS) plus a lightweight timing wrapper.
// Each project owns its own telemetry now; data pools in the shared PostHog
// project via the same key.

interface CaptureEvent {
  distinctId: string;
  event: string;
  properties?: Record<string, unknown>;
}

let _apiKey: string | null = null;
let _host = 'https://us.i.posthog.com';
const queue: Promise<unknown>[] = [];

export function configurePostHog(apiKey: string, host = 'https://us.i.posthog.com'): void {
  _apiKey = apiKey;
  _host = host.replace(/\/+$/, '');
}

export function capture(event: CaptureEvent): void {
  if (!_apiKey) return;
  const body = {
    api_key: _apiKey,
    distinct_id: event.distinctId,
    event: event.event,
    properties: event.properties ?? {},
    timestamp: new Date().toISOString(),
  };
  const promise = fetch(`${_host}/i/v0/e/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch((err) => {
    console.error('[telemetry] PostHog capture failed:', err instanceof Error ? err.message : err);
  });
  queue.push(promise);
}

export function identify(event: {
  distinctId: string;
  properties?: Record<string, unknown>;
}): void {
  capture({
    distinctId: event.distinctId,
    event: '$identify',
    properties: { $set: event.properties ?? {} },
  });
}

export async function flushPostHog(): Promise<void> {
  const pending = queue.splice(0, queue.length);
  await Promise.allSettled(pending);
}

export interface TraceOptions {
  silent?: boolean;
  project?: string;
  projectId?: string;
  context?: Record<string, unknown>;
}

/** Time an async operation (formerly ops' trace — console timing, rethrows on error). */
export async function trace<T>(
  name: string,
  fn: () => Promise<T>,
  options: TraceOptions = {}
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    if (!options.silent)
      console.info(`[trace] ${name} completed in ${(performance.now() - start).toFixed(2)}ms`);
    return result;
  } catch (err) {
    if (!options.silent)
      console.error(`[trace] ${name} failed after ${(performance.now() - start).toFixed(2)}ms`);
    throw err;
  }
}
