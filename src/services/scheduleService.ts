import { getSchedule, upsertScheduleItems, type ScheduleRow } from '../db/schedule';
import { getAnimeWatchlist } from '../db/watchlist';
import { animeStore } from '../store/animeStore';
import type { WatchlistData } from '../types/watchlist';
import { computeTimeline, type EnrichedScheduleItem } from './scheduleTimeline';

async function enrichScheduleItems(
  scheduleRows: ScheduleRow[],
  watchlist: WatchlistData | null
): Promise<EnrichedScheduleItem[]> {
  const allAnime = await animeStore.getAnimeList();
  const animeMap = new Map(allAnime.map((a) => [a.mal_id.toString(), a]));

  return scheduleRows.map((row) => {
    const anime = animeMap.get(row.mal_id);
    const watched = watchlist?.anime[row.mal_id];
    return {
      mal_id: row.mal_id,
      episodes_per_day: row.episodes_per_day,
      sort_order: row.sort_order,
      episodes_watched: row.episodes_watched,
      title:
        anime?.title_english ||
        anime?.title ||
        (watched?.title as string | undefined) ||
        `ID: ${row.mal_id}`,
      image: anime?.image,
      episodes: anime?.episodes,
      type: anime?.type,
      score: anime?.score,
      url: anime?.url,
      watchStatus: watched?.status || '',
    };
  });
}

export async function buildScheduleTimelineResponse(userId: string) {
  const [scheduleRows, watchlist] = await Promise.all([
    getSchedule(userId),
    getAnimeWatchlist(userId),
  ]);
  const items = await enrichScheduleItems(scheduleRows, watchlist);
  const { timeline, stats } = computeTimeline(items);
  return { items, timeline, stats };
}

export async function addScheduleItems(userId: string, malIds: string[], episodesPerDay: number) {
  await upsertScheduleItems(
    userId,
    malIds.map((id) => ({ malId: id, episodesPerDay: episodesPerDay }))
  );
}
