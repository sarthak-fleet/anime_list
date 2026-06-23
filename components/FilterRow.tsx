'use client';

import type { SearchFilter, FieldOptions, FilterActions } from '@/lib/types';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const GENRES = [
  'Comedy',
  'Action',
  'Fantasy',
  'Adventure',
  'Sci-Fi',
  'Drama',
  'Romance',
  'Supernatural',
  'Slice of Life',
  'Mystery',
  'Ecchi',
  'Sports',
  'Horror',
  'Avant Garde',
  'Suspense',
  'Award Winning',
  'Boys Love',
  'Gourmet',
  'Girls Love',
];

const THEMES = [
  'Music',
  'School',
  'Historical',
  'Mecha',
  'Military',
  'Adult Cast',
  'Parody',
  'Mythology',
  'Super Power',
  'Martial Arts',
  'Space',
  'Harem',
  'Psychological',
  'Isekai',
  'Anthropomorphic',
  'Detective',
  'Mahou Shoujo',
  'Strategy Game',
  'Team Sports',
  'Gore',
  'CGDCT',
  'Gag Humor',
  'Samurai',
  'Urban Fantasy',
  'Workplace',
  'Iyashikei',
  'Vampire',
  'Racing',
  'Time Travel',
  'Video Game',
  'Reincarnation',
  'Performing Arts',
  'Otaku Culture',
  'Love Polygon',
  'Pets',
  'Organized Crime',
  'Combat Sports',
  'Visual Arts',
  'Reverse Harem',
  'Survival',
  'Educational',
  'Childcare',
  'Delinquents',
  'Crossdressing',
  'High Stakes Game',
  'Medical',
  'Showbiz',
  'Love Status Quo',
  'Villainess',
];

const DEMOGRAPHICS = ['Shounen', 'Shoujo', 'Seinen', 'Josei', 'Kids'];

const SEASONS = ['winter', 'spring', 'summer', 'fall'];
const ANIME_TYPES = ['TV', 'Movie', 'OVA', 'ONA', 'Special', 'Music'];
const MANGA_TYPES = [
  'Manga',
  'Novel',
  'Light Novel',
  'One-shot',
  'Doujin',
  'Manhwa',
  'Manhua',
  'OEL',
];
const VALUE_SELECT_FIELDS = new Set(['type', 'season']);
const TEXT_ACTIONS = ['CONTAINS', 'EQUALS', 'EXCLUDES'];
const ENUM_ACTIONS = ['EQUALS', 'EXCLUDES'];

const FIELD_LABELS: Record<string, string> = {
  title: 'Title',
  title_english: 'English Title',
  synopsis: 'Synopsis',
  score: 'Score',
  scored_by: 'Scored By',
  rank: 'Rank',
  popularity: 'Popularity',
  members: 'Members',
  favorites: 'Favorites',
  year: 'Year',
  episodes: 'Episodes',
  genres: 'Genres',
  themes: 'Themes',
  demographics: 'Demographics',
  type: 'Type',
  season: 'Season',
};

const ACTION_LABELS: Record<string, string> = {
  EQUALS: 'is',
  CONTAINS: 'contains',
  EXCLUDES: 'is not',
  GREATER_THAN: 'greater than',
  GREATER_THAN_OR_EQUALS: 'at least',
  LESS_THAN: 'less than',
  LESS_THAN_OR_EQUALS: 'at most',
  INCLUDES_ALL: 'includes all',
  INCLUDES_ANY: 'includes any',
};

interface Props {
  filter: SearchFilter;
  index: number;
  fields: FieldOptions;
  actions: FilterActions;
  mediaType?: 'anime' | 'manga';
  onChange: (index: number, filter: SearchFilter) => void;
  onRemove: (index: number) => void;
}

function humanize(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function getFieldLabel(field: string): string {
  return FIELD_LABELS[field] ?? humanize(field);
}

function getActionLabel(action: string): string {
  return ACTION_LABELS[action] ?? humanize(action.toLowerCase());
}

function isValueSelectField(field: string): boolean {
  return VALUE_SELECT_FIELDS.has(field);
}

function getActionsForField(field: string, fields: FieldOptions, actions: FilterActions): string[] {
  if (fields.numeric.includes(field)) return [...actions.comparison];
  if (fields.array.includes(field)) return [...actions.array];
  if (isValueSelectField(field)) return [...ENUM_ACTIONS];
  return [...TEXT_ACTIONS];
}

function isArrayField(field: string, fields: FieldOptions): boolean {
  return fields.array.includes(field);
}

function getDefaultAction(field: string, fields: FieldOptions, actions: FilterActions): string {
  if (fields.numeric.includes(field)) {
    return field === 'rank' || field === 'popularity'
      ? 'LESS_THAN_OR_EQUALS'
      : 'GREATER_THAN_OR_EQUALS';
  }
  if (fields.array.includes(field)) {
    return actions.array.includes('INCLUDES_ANY')
      ? 'INCLUDES_ANY'
      : actions.array[0] || 'INCLUDES_ANY';
  }
  if (isValueSelectField(field)) return 'EQUALS';
  return 'CONTAINS';
}

function getValueOptions(field: string, mediaType: 'anime' | 'manga'): string[] | null {
  if (field === 'genres') return GENRES;
  if (field === 'themes') return THEMES;
  if (field === 'demographics') return DEMOGRAPHICS;
  if (field === 'season') return SEASONS;
  if (field === 'type') return mediaType === 'manga' ? MANGA_TYPES : ANIME_TYPES;
  if (field === 'status') {
    return ['Publishing', 'Finished', 'On Hiatus', 'Discontinued', 'Not yet published'];
  }
  return null;
}

export default function FilterRow({
  filter,
  index,
  fields,
  actions,
  mediaType = 'anime',
  onChange,
  onRemove,
}: Props) {
  const allFields = [...fields.numeric, ...fields.array, ...fields.string];
  const availableActions = getActionsForField(filter.field, fields, actions);
  const isArray = isArrayField(filter.field, fields);
  const valueOptions = getValueOptions(filter.field, mediaType);
  const normalizedAction = availableActions.includes(filter.action)
    ? filter.action
    : availableActions[0];
  const normalizedValue = isArray
    ? Array.isArray(filter.value)
      ? filter.value
      : []
    : Array.isArray(filter.value)
      ? (filter.value[0] ?? '')
      : filter.value;

  const normalizedFilter: SearchFilter = {
    ...filter,
    action: normalizedAction,
    value: normalizedValue,
  };

  const handleFieldChange = (field: string) => {
    onChange(index, {
      ...normalizedFilter,
      field,
      action: getDefaultAction(field, fields, actions),
      value: isArrayField(field, fields) ? [] : '',
    });
  };

  const handleValueChange = (value: string) => {
    if (isArray) {
      const current = Array.isArray(normalizedFilter.value) ? normalizedFilter.value : [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      onChange(index, { ...normalizedFilter, value: updated });
    } else if (fields.numeric.includes(filter.field)) {
      onChange(index, { ...normalizedFilter, value: value === '' ? '' : Number(value) });
    } else {
      onChange(index, { ...normalizedFilter, value });
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3 sm:flex-row sm:items-center">
      <div className="flex flex-1 flex-wrap gap-2">
        <select
          value={normalizedFilter.field}
          onChange={(e) => handleFieldChange(e.target.value)}
          className="h-9 min-w-[120px] rounded-md border border-border bg-muted/30 px-2.5 text-sm text-foreground focus:border-ring focus:outline-none"
        >
          {allFields.map((f) => (
            <option key={f} value={f}>
              {getFieldLabel(f)}
            </option>
          ))}
        </select>

        <select
          value={normalizedFilter.action}
          onChange={(e) => onChange(index, { ...normalizedFilter, action: e.target.value })}
          className="h-9 min-w-[120px] rounded-md border border-border bg-muted/30 px-2.5 text-sm text-foreground focus:border-ring focus:outline-none"
        >
          {availableActions.map((a) => (
            <option key={a} value={a}>
              {getActionLabel(a)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-[2] flex-wrap items-center gap-2">
        {isArray && valueOptions ? (
          valueOptions.map((opt) => {
            const selected = Array.isArray(filter.value) && filter.value.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleValueChange(opt)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                  selected
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border text-muted-foreground hover:border-ring hover:text-foreground'
                )}
              >
                {opt}
              </button>
            );
          })
        ) : valueOptions ? (
          <select
            value={typeof normalizedFilter.value === 'string' ? normalizedFilter.value : ''}
            onChange={(e) => handleValueChange(e.target.value)}
            className="h-9 w-full rounded-md border border-border bg-muted/30 px-2.5 text-sm text-foreground focus:border-ring focus:outline-none"
          >
            <option value="">Select value…</option>
            {valueOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={fields.numeric.includes(filter.field) ? 'number' : 'text'}
            value={normalizedFilter.value as string | number}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder="Value"
            className="h-9 w-full rounded-md border border-border bg-muted/30 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
          />
        )}
      </div>

      <button
        type="button"
        onClick={() => onRemove(index)}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        aria-label="Remove filter"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
