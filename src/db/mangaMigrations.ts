import { getMangaCatalogDb } from './client';

export async function migrateMangaCatalogTable(): Promise<void> {
  const db = getMangaCatalogDb();
  const tables = await db.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='manga_data'"
  );

  if (tables.rows.length > 0) {
    return;
  }

  console.log('Creating manga_data table in manga catalog database...');

  await db.execute(`
    CREATE TABLE manga_data (
      mal_id INTEGER PRIMARY KEY,
      url TEXT NOT NULL,
      title TEXT NOT NULL,
      title_english TEXT,
      type TEXT,
      chapters INTEGER,
      volumes INTEGER,
      published_from TEXT,
      published_to TEXT,
      score REAL,
      scored_by INTEGER,
      rank INTEGER,
      status TEXT,
      popularity INTEGER,
      members INTEGER,
      favorites INTEGER,
      synopsis TEXT,
      year INTEGER,
      image TEXT,
      has_colored INTEGER,
      is_completed INTEGER,
      available_in_english INTEGER,
      available_languages TEXT,
      genres TEXT NOT NULL DEFAULT '{}',
      themes TEXT NOT NULL DEFAULT '{}',
      demographics TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await db.batch([
    'CREATE INDEX IF NOT EXISTS idx_manga_data_score ON manga_data(score)',
    'CREATE INDEX IF NOT EXISTS idx_manga_data_members ON manga_data(members)',
    'CREATE INDEX IF NOT EXISTS idx_manga_data_year ON manga_data(year)',
  ]);
}
