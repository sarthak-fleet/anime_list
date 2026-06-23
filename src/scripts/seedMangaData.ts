#!/usr/bin/env node
import 'dotenv/config';
import { readJsonFile } from '../utils/file';
import { FILE_PATHS } from '../config';
import type { MangaItem } from '../types/manga';
import { upsertMangaBatch } from '../db/mangaData';
import { migrateMangaCatalogTable } from '../db/mangaMigrations';

async function main() {
  console.log('Starting manga catalog migration to Turso...');

  await migrateMangaCatalogTable();

  const mangaData = await readJsonFile<MangaItem[]>(FILE_PATHS.cleanMangaData);
  if (!mangaData || mangaData.length === 0) {
    console.error('No manga data found in cleaned_manga_data.json');
    process.exit(1);
  }

  console.log(`Found ${mangaData.length} manga in JSON file`);
  await upsertMangaBatch(mangaData);
  console.log('✓ Manga catalog migration completed successfully');
  process.exit(0);
}

main().catch((error) => {
  console.error('Manga migration failed:', error);
  process.exit(1);
});
