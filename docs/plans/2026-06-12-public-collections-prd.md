# Public collections PRD

**Status:** Draft  
**Product:** Shelf / MAL Explorer (`anime_list`)  
**Date:** 2026-06-12

## Summary

Add public, shareable collections that let a user package anime or manga into a curated list with a title, description, and cover grid. This creates a lightweight publishing surface for tastemakers, recommendations, and seasonal roundups.

## Problem

Shelf has strong discovery primitives, but most of the product remains private and transactional. Users can search, watchlist, and quiz, but they cannot easily publish a taste artifact that other people can browse and share.

## Goals

- Give users a reason to create and share lists
- Increase top-of-funnel reach through public pages
- Reuse the existing catalog, detail pages, and poster assets
- Make the public surface simple enough to moderate

## Non-goals

- Do not build full social following or follower feeds in v1
- Do not create comments, likes, or threaded discussion
- Do not allow arbitrary user-generated HTML
- Do not expose private watchlist data on public pages

## User stories

- As a signed-in user, I can create a collection from selected titles
- As a signed-in user, I can write a title and short description
- As a visitor, I can open a public collection page and browse its titles
- As a visitor, I can jump from a collection to a detail page or search page

## Proposed UX

- Add a `Create collection` flow from `/watchlist`, `/search`, or a title page
- Show collections as card grids with posters and a short intro
- Offer a public URL that is stable and easy to share
- Provide an optional cover image or hero composition using existing posters

## Collection types

- Personal picks
- Seasonal roundup
- Genre starter pack
- Mood-based bundle
- Watchlist highlights

## Data model sketch

- `collections`
  - `id`
  - `user_id`
  - `slug`
  - `title`
  - `description`
  - `visibility`
  - `cover_mode`
  - `created_at`
  - `updated_at`
- `collection_items`
  - `id`
  - `collection_id`
  - `mal_id`
  - `media_type`
  - `position`
  - `note`
  - `created_at`

## Technical shape

- Frontend:
  - collection editor with reorder, add/remove, and description fields
  - public collection page with poster grid and CTA back into search/detail routes
- Backend:
  - CRUD endpoints for collections and items
  - ownership checks on edit/delete
  - optional slug-based public read endpoint
- Moderation:
  - allow only authenticated creation
  - rate limit collection creation
  - keep content to text and catalog links only

## Metrics

- Creation rate: how many users publish at least one collection
- Share rate: how many public pages are opened by non-authenticated visitors
- Clickthrough: downstream clicks into `/anime`, `/manga`, or `/search`
- Retention: return visits from users who created or shared collections

## Risks

- Low-quality spam collections if creation is too easy
- Poster image policy issues if the composition path is not careful
- Duplicate effort if collections overlap too much with watchlist tagging

## Acceptance criteria

- A user can create and publish a collection
- A visitor can view the collection without signing in
- The page links back into existing title and search surfaces
- A collection can be edited or removed by its owner

## Recommended next step

Build a private alpha first: create collections from watchlist entries, render them publicly, and measure whether shared pages produce meaningful clickthrough before adding discovery ranking or social features.
