import { createClient, type Client } from '@libsql/client/web';

let client: Client | null = null;
let mangaCatalogClient: Client | null = null;

export function getDb(): Client {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url) {
      throw new Error('TURSO_DATABASE_URL env variable is required');
    }

    client = createClient({ url, authToken });
  }
  return client;
}

/** Manga title catalog — separate Turso DB in production; falls back to app DB locally. */
export function getMangaCatalogDb(): Client {
  if (!mangaCatalogClient) {
    const url = process.env.TURSO_MANGA_DATABASE_URL?.trim() || process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_MANGA_AUTH_TOKEN?.trim() || process.env.TURSO_AUTH_TOKEN;

    if (!url) {
      throw new Error('TURSO_MANGA_DATABASE_URL or TURSO_DATABASE_URL is required');
    }

    mangaCatalogClient = createClient({ url, authToken });
  }
  return mangaCatalogClient;
}
