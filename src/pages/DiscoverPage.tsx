import { Suspense } from 'react';
import { DiscoveryQueue } from '@/components/DiscoveryQueue';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
      <ErrorBoundary>
        <DiscoveryQueue />
      </ErrorBoundary>
    </Suspense>
  );
}
