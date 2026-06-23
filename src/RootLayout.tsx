import { Suspense, lazy } from 'react';
import { Outlet } from '@tanstack/react-router';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/lib/auth';
import { AnalyticsProvider } from '@/components/posthog-provider';

const FeedbackWidgetWrapper = lazy(() => import('@/components/FeedbackWidgetWrapper'));

function RouteFallback() {
  return <div className="min-h-[40vh] animate-pulse rounded-lg bg-muted/30" aria-hidden />;
}

export default function RootLayout() {
  return (
    <AnalyticsProvider>
      <AuthProvider>
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 pt-8">
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </main>
        <Footer />
        <Suspense fallback={null}>
          <FeedbackWidgetWrapper />
        </Suspense>
      </AuthProvider>
    </AnalyticsProvider>
  );
}
