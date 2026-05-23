/**
 * Manga API logic — retained for a future Cloudflare Worker port.
 * Not wired to any runtime route today.
 */
import {
  addMangaToWatched,
  filterMangaList,
  getMangaFieldValue,
  getWatchedMangaList,
} from "../dataProcessor";
import { getMangaStats } from "../statistics";
import { mangaStore } from "../store/mangaStore";
import {
  ARRAY_ACTIONS,
  COMPARISON_ACTIONS,
  TEXT_SEARCH_ACTIONS,
} from "../types/anime";
import {
  MANGA_ARRAY_FIELDS,
  MANGA_BOOLEAN_FIELDS,
  MANGA_NUMERIC_FIELDS,
  MANGA_STRING_FIELDS,
} from "../types/manga";
import { MangaFilterRequestBody } from "../validators/mangaFilters";
import { hideWatchedItems, takePage } from "../controllers/helpers";

const sortManga = (
  list: Awaited<ReturnType<typeof filterMangaList>>,
  sortBy: MangaFilterRequestBody["sortBy"],
) => {
  if (!sortBy) return list;
  return [...list].sort((a, b) => {
    const aValue = (getMangaFieldValue(a, sortBy) as number) || 0;
    const bValue = (getMangaFieldValue(b, sortBy) as number) || 0;
    return bValue - aValue;
  });
};

export function getMangaFieldsData() {
  return {
    numeric: MANGA_NUMERIC_FIELDS,
    array: MANGA_ARRAY_FIELDS,
    string: MANGA_STRING_FIELDS,
    boolean: MANGA_BOOLEAN_FIELDS,
  };
}

export function getMangaFilterOptionsData() {
  return {
    comparison: COMPARISON_ACTIONS,
    array: ARRAY_ACTIONS,
    text: TEXT_SEARCH_ACTIONS,
  };
}

export async function getMangaStatisticsData() {
  const mangaList = await mangaStore.getMangaList();
  if (!mangaList || mangaList.length === 0) {
    return { error: "No manga data found. Please wait for initialization.", status: 404 as const };
  }
  return { data: await getMangaStats(mangaList) };
}

export async function searchMangaData(
  userId: string | undefined,
  body: MangaFilterRequestBody,
) {
  const { filters, hideWatched, pagesize, sortBy } = body;

  let filtered = await filterMangaList(filters);
  if (userId) {
    filtered = await hideWatchedItems(
      filtered,
      hideWatched,
      () => getWatchedMangaList(userId),
      (list) => list.manga,
    );
  }

  const sorted = sortManga(filtered, sortBy);

  return {
    manga: takePage(sorted, pagesize),
    total: filtered.length,
    pagesize,
    hasMore: filtered.length > pagesize,
  };
}

export async function addMangaToWatchlist(
  userId: string,
  malIds: number[],
  status: string,
  tagColor?: string,
) {
  await addMangaToWatched(malIds, status, userId, tagColor);
}

export async function getMangaWatchlistData(userId: string) {
  const watchlist = await getWatchedMangaList(userId);
  if (!watchlist) {
    return { error: "Manga watchlist not found", status: 404 as const };
  }
  return { data: watchlist };
}
