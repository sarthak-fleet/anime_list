import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Bell, Pause, Play, Trash2 } from 'lucide-react';
import {
  deleteSavedSearch,
  listSavedSearchAlerts,
  listSavedSearches,
  markSavedSearchAlertsSeen,
  updateSavedSearch,
} from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function parseFilters(raw: string): string {
  try {
    const filters = JSON.parse(raw) as Array<{ field: string; action: string; value: unknown }>;
    if (!Array.isArray(filters) || filters.length === 0) return 'No filters';
    return filters
      .slice(0, 4)
      .map((filter) => {
        const value = Array.isArray(filter.value) ? filter.value.join(', ') : String(filter.value);
        return `${filter.field} ${filter.action.toLowerCase().replace(/_/g, ' ')} ${value}`;
      })
      .join(' · ');
  } catch {
    return 'Saved filters';
  }
}

export default function AlertsPage() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['saved-searches'],
    queryFn: listSavedSearches,
    enabled: !!user,
  });

  const { data: alertsData } = useQuery({
    queryKey: ['saved-search-alerts'],
    queryFn: () => listSavedSearchAlerts(false),
    enabled: !!user,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, paused }: { id: string; paused: boolean }) =>
      updateSavedSearch(id, { paused }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['saved-searches'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSavedSearch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
      queryClient.invalidateQueries({ queryKey: ['saved-search-alerts'] });
    },
  });

  const seenMutation = useMutation({
    mutationFn: (alertIds: string[]) => markSavedSearchAlertsSeen(alertIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
      queryClient.invalidateQueries({ queryKey: ['saved-search-alerts'] });
    },
  });

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-sm text-muted-foreground">Loading…</div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Card className="p-6">
          <h1 className="text-xl font-semibold">Saved search alerts</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to save searches and get in-app alerts when new titles match.
          </p>
        </Card>
      </div>
    );
  }

  const searches = data?.searches ?? [];
  const alerts = alertsData?.alerts ?? [];
  const unseenIds = alerts.filter((alert) => !alert.seen_at).map((alert) => alert.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Saved search alerts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            In-app alerts when the catalog refresh finds new anime matching your saved filters.
          </p>
        </div>
        {(data?.unseenCount ?? 0) > 0 && (
          <Badge variant="secondary" className="gap-1">
            <Bell className="h-3.5 w-3.5" />
            {data?.unseenCount} new
          </Badge>
        )}
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Recent matches</h2>
          {unseenIds.length > 0 && (
            <button
              type="button"
              onClick={() => seenMutation.mutate(unseenIds)}
              className="text-xs text-primary hover:underline"
            >
              Mark all seen
            </button>
          )}
        </div>
        {alerts.length === 0 ? (
          <Card className="p-5 text-sm text-muted-foreground">
            No alerts yet. Save a search from the search page.
          </Card>
        ) : (
          <div className="space-y-2">
            {alerts.slice(0, 20).map((alert) => (
              <Card key={alert.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-medium truncate">{alert.title ?? `MAL ${alert.mal_id}`}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {alert.search_name} · {alert.match_reason ?? 'Matched saved filters'}
                  </p>
                </div>
                <Link
                  to="/anime/$malId"
                  params={{ malId: alert.mal_id }}
                  className="shrink-0 text-xs font-medium text-primary hover:underline"
                >
                  Open
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Saved searches</h2>
        {isLoading ? (
          <Card className="p-5 text-sm text-muted-foreground">Loading saved searches…</Card>
        ) : searches.length === 0 ? (
          <Card className="p-5 text-sm text-muted-foreground">
            No saved searches yet. Use{' '}
            <Link to="/search" className="text-primary hover:underline">
              Search
            </Link>{' '}
            and click Save search.
          </Card>
        ) : (
          <div className="space-y-2">
            {searches.map((search) => (
              <Card key={search.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{search.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {parseFilters(search.filters_json)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        toggleMutation.mutate({ id: search.id, paused: !search.paused })
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-accent"
                      aria-label={search.paused ? 'Resume alerts' : 'Pause alerts'}
                    >
                      {search.paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(search.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-accent text-destructive"
                      aria-label="Delete saved search"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {search.paused ? 'Paused' : 'Active'} · last checked{' '}
                  {search.last_checked_at ?? 'never'}
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
