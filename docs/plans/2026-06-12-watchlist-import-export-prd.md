# Watchlist import/export PRD

**Status:** Draft  
**Product:** Shelf / MAL Explorer (`anime_list`)  
**Date:** 2026-06-12

## Summary

Add reliable watchlist import and export so users can move data into and out of Shelf without friction. This is a retention and trust feature: it lowers migration risk, makes backups possible, and creates a safe path for bulk onboarding.

## Problem

The current watchlist experience assumes the user starts and stays inside Shelf. That is restrictive for users who already have a list elsewhere, or who want a backup before they trust the app as their main tracker.

## Goals

- Reduce the cost of trying Shelf for existing MAL users
- Make user data portable
- Improve confidence in watchlist persistence and recovery
- Support bulk edits without requiring manual re-entry

## Non-goals

- Do not build a generic file manager or document import system
- Do not support every anime site format in v1
- Do not redesign watch status semantics
- Do not expose raw database exports publicly

## User stories

- As a user, I can export my watchlist to CSV or JSON
- As a user, I can import a watchlist from a supported format
- As a user, I can preview import conflicts before applying changes
- As a user, I can choose whether imports merge, replace, or skip duplicates

## Supported import sources

- MAL-style CSV export
- Shelf JSON backup
- Potential future adapters for AniList or other list formats

## Import modes

- Merge new items only
- Replace matching titles
- Review and resolve conflicts manually

## Data model sketch

- `watchlist_import_jobs`
  - `id`
  - `user_id`
  - `source_type`
  - `status`
  - `preview_json`
  - `created_at`
  - `completed_at`
- `watchlist_exports`
  - `id`
  - `user_id`
  - `format`
  - `created_at`

## Technical shape

- Frontend:
  - import/export entry points on `/watchlist`
  - preview screen with conflict counts and proposed actions
  - progress and success states
- Backend:
  - export endpoint for authenticated users
  - upload/parse endpoint for supported formats
  - conflict resolution that reuses existing watchlist mutation logic
- Privacy:
  - keep files ephemeral by default
  - avoid storing imported files after processing unless the user explicitly requests a backup copy

## Metrics

- Import completion rate
- Export usage rate
- Conflict resolution success rate
- Reduction in support requests about lost or missing watchlist data

## Risks

- Parsing edge cases across source formats
- Support burden if users expect every external service format on day one
- Confusion if merge and replace semantics are not explicit

## Acceptance criteria

- A user can export their watchlist in a supported format
- A user can preview and import a file with conflict handling
- Imports do not silently overwrite titles without confirmation
- The feature uses existing auth and watchlist storage patterns

## Recommended next step

Ship export first, then add import preview and merge mode. That gives users an immediate backup path while keeping the higher-risk parsing workflow behind a narrower surface.
