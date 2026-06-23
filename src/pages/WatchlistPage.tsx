import WatchlistView from '@/components/WatchlistView';

export default function WatchlistPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Watchlist</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your anime watchlist with custom tags
        </p>
      </div>
      <WatchlistView />
    </div>
  );
}
