import { beforeEach, describe, it, vi } from 'vitest';
import { getAnimeWatchlist, upsertAnimeWatchlist } from '../../db/watchlist';
import { getSchedule, upsertScheduleItems } from '../../db/schedule';
import { animeStore } from '../../store/animeStore';
import type { AnimeItem } from '../../types/anime';
import { addScheduleItems, buildScheduleTimelineResponse } from '../../services/scheduleService';

vi.mock('../../db/watchlist', () => ({
  getAnimeWatchlist: vi.fn(),
  upsertAnimeWatchlist: vi.fn(),
}));

vi.mock('../../db/schedule', () => ({
  getSchedule: vi.fn(),
  upsertScheduleItems: vi.fn(),
  updateScheduleItem: vi.fn(),
  removeScheduleItems: vi.fn(),
  reorderSchedule: vi.fn(),
}));

vi.mock('../../store/animeStore', () => ({
  animeStore: {
    getAnimeList: vi.fn(),
  },
}));

const mockedGetAnimeWatchlist = vi.mocked(getAnimeWatchlist);
const mockedUpsertAnimeWatchlist = vi.mocked(upsertAnimeWatchlist);
const mockedGetSchedule = vi.mocked(getSchedule);
const mockedUpsertScheduleItems = vi.mocked(upsertScheduleItems);
const mockedGetAnimeList = vi.mocked(animeStore.getAnimeList);

describe('scheduleService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not backfill schedule rows from watchlist items marked Watching', async () => {
    mockedGetSchedule.mockResolvedValue([]);
    mockedGetAnimeWatchlist.mockResolvedValue({
      user: { id: 'user-1', name: 'User' },
      anime: {
        '1': {
          id: '1',
          status: 'Watching',
        },
      },
    });
    mockedGetAnimeList.mockResolvedValue([
      {
        mal_id: 1,
        url: 'https://myanimelist.net/anime/1',
        title: 'Cowboy Bebop',
        title_english: 'Cowboy Bebop',
        type: 'TV',
        episodes: 26,
        score: 8.7,
        genres: {},
        themes: {},
        demographics: {},
      },
    ] as AnimeItem[]);

    const result = await buildScheduleTimelineResponse('user-1');

    expect(mockedUpsertScheduleItems).not.toHaveBeenCalled();
    expect(result.items).toEqual([]);
  });

  it('keeps watchlist status as display-only metadata for scheduled items', async () => {
    mockedGetSchedule.mockResolvedValue([
      {
        mal_id: '1',
        episodes_per_day: 3,
        sort_order: 0,
        episodes_watched: 0,
      },
    ]);
    mockedGetAnimeWatchlist.mockResolvedValue({
      user: { id: 'user-1', name: 'User' },
      anime: {
        '1': {
          id: '1',
          status: 'Done',
        },
      },
    });
    mockedGetAnimeList.mockResolvedValue([
      {
        mal_id: 1,
        url: 'https://myanimelist.net/anime/1',
        title: 'Cowboy Bebop',
        title_english: 'Cowboy Bebop',
        type: 'TV',
        episodes: 26,
        score: 8.7,
        genres: {},
        themes: {},
        demographics: {},
      },
    ] as AnimeItem[]);

    const result = await buildScheduleTimelineResponse('user-1');

    expect(mockedUpsertScheduleItems).not.toHaveBeenCalled();
    expect(result.items).toEqual([
      expect.objectContaining({
        mal_id: '1',
        watchStatus: 'Done',
      }),
    ]);
  });

  it('does not add watchlist entries when adding anime to the schedule', async () => {
    await addScheduleItems('user-1', ['1'], 4);

    expect(mockedUpsertScheduleItems).toHaveBeenCalledWith('user-1', [
      { malId: '1', episodesPerDay: 4 },
    ]);
    expect(mockedUpsertAnimeWatchlist).not.toHaveBeenCalled();
  });
});
