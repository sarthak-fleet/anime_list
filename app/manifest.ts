import type { MetadataRoute } from "next";

// PWA manifest — makes NEON CURATOR installable to a phone home screen and
// launchable as a standalone app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NEON CURATOR — Discover & Track Anime",
    short_name: "NEON CURATOR",
    description:
      "Discover anime with powerful filters, explore statistics across 15,000+ titles, and track your watchlist. Built on MyAnimeList data.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0f172a",
    theme_color: "#60a5fa",
    categories: ["entertainment", "lifestyle"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
