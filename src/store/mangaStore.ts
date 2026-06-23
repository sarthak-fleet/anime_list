import type { MangaItem } from '../types/manga';
import { getAllManga } from '../db/mangaData';

class MangaStore {
  private mangaList: MangaItem[] = [];
  private static instance: MangaStore;
  private lastLoadedAt = 0;
  private isRefreshing = false;
  private coldLoadPromise: Promise<MangaItem[]> | null = null;
  private readonly CACHE_TTL = 60 * 60 * 1000;

  private constructor() {}

  static getInstance(): MangaStore {
    if (!MangaStore.instance) {
      MangaStore.instance = new MangaStore();
    }
    return MangaStore.instance;
  }

  async setMangaList(mangaData?: MangaItem[] | null): Promise<void> {
    if (!mangaData) {
      mangaData = await getAllManga();
    }
    if (!mangaData || mangaData.length === 0) {
      return console.error('No manga data found in catalog database');
    }
    console.log(`Loaded ${mangaData.length} manga from catalog database`);
    this.mangaList = mangaData;
    this.lastLoadedAt = Date.now();
  }

  async getMangaList(): Promise<MangaItem[]> {
    const now = Date.now();
    const isExpired = now - this.lastLoadedAt > this.CACHE_TTL;
    const isEmpty = this.mangaList.length === 0;

    if (isEmpty) {
      if (!this.coldLoadPromise) {
        console.log('Manga cache empty, loading from catalog database...');
        this.coldLoadPromise = (async () => {
          try {
            await this.setMangaList();
            return this.mangaList;
          } finally {
            this.coldLoadPromise = null;
          }
        })();
      }
      return this.coldLoadPromise;
    }

    if (isExpired && !this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshWithRetry();
    }

    return this.mangaList;
  }

  private async refreshWithRetry(attempt = 1, maxAttempts = 3): Promise<void> {
    try {
      await this.setMangaList();
      console.log('✓ Manga background cache refresh complete');
    } catch (err) {
      if (attempt < maxAttempts) {
        console.warn(
          `Manga cache refresh attempt ${attempt}/${maxAttempts} failed, retrying in 30s...`
        );
        setTimeout(() => this.refreshWithRetry(attempt + 1, maxAttempts), 30000);
        return;
      }
      console.error('✗ Manga background cache refresh failed after all retries:', err);
    } finally {
      this.isRefreshing = false;
    }
  }

  clearStore(): void {
    this.mangaList = [];
    this.lastLoadedAt = 0;
    this.isRefreshing = false;
  }
}

export const mangaStore = MangaStore.getInstance();
