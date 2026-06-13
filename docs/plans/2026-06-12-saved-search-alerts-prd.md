# Saved search alerts PRD

**Status:** Draft  
**Product:** Shelf / MAL Explorer (`anime_list`)  
**Date:** 2026-06-12

## Summary

Let users save a search, then receive alerts when new anime or manga match that saved filter set. This turns the current discovery search into a recurring retention loop instead of a one-off browse session.

## Problem

Shelf already supports powerful filter state in the URL, but users still have to remember to come back and re-run the same search. That is fine for power users, but it leaves repeat discovery value on the table for:

- seasonal watchers who want new shows matching a narrow taste profile
- manga readers who want to track emerging titles by genre or score
- signed-in users who want a low-friction reason to return

## Goals

- Increase repeat sessions from users who already expressed a taste intent
- Make search feel persistent without requiring new ranking infrastructure
- Reuse existing filter syntax, catalog data, and worker cron

## Non-goals

- Do not build a generic notification center for the whole app in v1
- Do not add push notifications or mobile app support
- Do not create a new recommendation model
- Do not send alerts for watchlist status changes unless they come from saved search matches

## User stories

- As a signed-in user, I can save a search from `/search` and name it
- As a signed-in user, I can choose alert frequency and delivery mode
- As a signed-in user, I can see why a title matched my saved search
- As a signed-in user, I can pause, edit, or delete a saved search

## Proposed UX

- Add a `Save search` action on `/search` when the filter state is non-empty
- Show a compact saved-search list on `/watchlist` or a new `/alerts` page
- Include a badge or preview of the filter logic, not raw JSON
- Surface a small `New matches` count when the catalog refresh finds fresh results

## Alert model

### V1 delivery options

- In-app alert badge only
- Daily digest email

### Matching rule

- Reuse the existing filter engine against new catalog rows
- Alert only when a title crosses the saved filter boundary for the first time
- Suppress duplicate alerts for titles already surfaced to that saved search

### Frequency

- Immediate on daily sync completion
- Daily digest at a fixed UTC time

## Data model sketch

- `saved_searches`
  - `id`
  - `user_id`
  - `name`
  - `filters_json`
  - `channel`
  - `frequency`
  - `last_checked_at`
  - `created_at`
  - `updated_at`
- `saved_search_alerts`
  - `id`
  - `saved_search_id`
  - `mal_id`
  - `title_type`
  - `created_at`
  - `seen_at`

## Technical shape

- Frontend:
  - add save/edit flows near search results and watchlist navigation
  - build an alerts view with filter summary, recent matches, and mute controls
- Backend:
  - add CRUD endpoints for saved searches
  - reuse the worker cron to compute new matches after catalog refresh
  - reuse existing auth and user tables
- Scheduler:
  - evaluate saved searches after daily anime and manga updates
  - create digest payloads for opted-in users

## Metrics

- Save rate: percentage of search sessions that become saved searches
- Return rate: users who come back within 7 days of creating a saved search
- Alert engagement: open/click rate on alert surfaced matches
- Match quality: percentage of alerts clicked versus dismissed

## Risks

- Alert spam if filters are too broad
- Duplicate matches if alert deduping is weak
- Email delivery overhead if it is bundled too early

## Acceptance criteria

- A signed-in user can save a search and see it later
- The system can detect new matching titles after catalog updates
- The first notification path works without new recommendation logic
- Saved searches can be paused or deleted

## Recommended next step

Prototype the smallest viable version with in-app alerts only, using the existing filter state and daily worker cron. If engagement is weak, stop before adding email.
