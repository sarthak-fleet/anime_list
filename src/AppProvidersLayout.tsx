import { Outlet } from '@tanstack/react-router';
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router';
import { QueryProvider } from '@/lib/query-provider';

/** Wraps data-heavy routes that need TanStack Query + nuqs URL state. */
export default function AppProvidersLayout() {
  return (
    <NuqsAdapter>
      <QueryProvider>
        <Outlet />
      </QueryProvider>
    </NuqsAdapter>
  );
}
