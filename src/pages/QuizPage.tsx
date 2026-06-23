import AnimeIdentityQuiz from '@/components/AnimeIdentityQuiz';

export default function QuizPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Privacy-safe prototype
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Find your Shelf archetype.
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Answer four structured questions. Nothing is stored, no social profile is scraped, and the
          result only links back into existing anime search filters.
        </p>
      </div>
      <AnimeIdentityQuiz />
    </main>
  );
}
