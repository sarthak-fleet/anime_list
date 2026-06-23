#!/usr/bin/env node
import dotenv from 'dotenv';
import { updateLatestTopMangaData } from '../api';
import { API_CONFIG } from '../config';
import { migrateMangaCatalogTable } from '../db/mangaMigrations';
import { mangaStore } from '../store/mangaStore';

dotenv.config({ path: '.env.local' });
dotenv.config();

function resolveMaxPages(): number {
  if (process.argv.includes('--full')) {
    return API_CONFIG.totalPages;
  }
  const pagesArg = process.argv.find((arg) => arg.startsWith('--pages='));
  if (pagesArg) {
    const parsed = Number(pagesArg.slice('--pages='.length));
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return API_CONFIG.mangaDailyUpdatePages;
}

/**
 * Cron job script to update manga catalog in Turso.
 * Fetches top-ranked manga from Jikan and upserts into manga_data.
 */
async function main() {
  const maxPages = resolveMaxPages();
  console.log(
    `[${new Date().toISOString()}] Starting manga data update (${maxPages} pages max)...`
  );

  try {
    await migrateMangaCatalogTable();
    await updateLatestTopMangaData(maxPages);
    await mangaStore.setMangaList();

    console.log(`[${new Date().toISOString()}] ✓ Manga data update completed successfully`);
    process.exit(0);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ✗ Error updating manga data:`, error);
    process.exit(1);
  }
}

main();
