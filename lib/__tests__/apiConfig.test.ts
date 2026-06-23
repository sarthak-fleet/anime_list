import { afterEach, describe, expect, it, vi } from 'vitest';
import { getApiUrl, LOCAL_API_URL, PRODUCTION_API_URL } from '../apiConfig';

describe('getApiUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses configured deployment API URL when present', () => {
    vi.stubEnv('VITE_API_URL', `${PRODUCTION_API_URL}/`);

    expect(getApiUrl('anime-list-9lk.pages.dev')).toBe(PRODUCTION_API_URL);
  });

  it('falls back to production API on deployed hosts', () => {
    vi.stubEnv('VITE_API_URL', '');

    expect(getApiUrl('anime-list-9lk.pages.dev')).toBe(PRODUCTION_API_URL);
  });

  it('uses localhost only for local browser development', () => {
    vi.stubEnv('VITE_API_URL', '');
    vi.stubEnv('DEV', true);
    vi.stubEnv('PROD', false);

    expect(getApiUrl('localhost')).toBe(LOCAL_API_URL);
  });

  it('does not fall back to localhost in production', () => {
    vi.stubEnv('VITE_API_URL', '');
    vi.stubEnv('DEV', false);
    vi.stubEnv('PROD', true);

    expect(getApiUrl('localhost')).toBe(PRODUCTION_API_URL);
  });
});
