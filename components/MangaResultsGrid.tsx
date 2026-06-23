'use client';

import type { SearchResponse } from '@/lib/types';
import MangaCard from './MangaCard';

export function MangaResultsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="animate-pulse aspect-[2/3] rounded-sm bg-surface-container-high" />
      ))}
    </div>
  );
}

export default function MangaResultsGrid({ results }: { results: SearchResponse }) {
  return (
    <div className="space-y-6">
      {results.filteredList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
          {results.filteredList.map((item, index) => (
            <MangaCard key={item.id} manga={item} priority={index < 4} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/20 py-24 text-center">
          <p className="text-lg font-medium text-foreground">No titles match</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Try clearing a filter, lowering the popularity threshold, or searching with a different
            title.
          </p>
        </div>
      )}
    </div>
  );
}
