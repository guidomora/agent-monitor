# Repo Structure

## Purpose

Explain where code should live so agents can make changes without scattering logic across the app.

## When to read this

Read this before adding a feature, moving code, or deciding whether a file belongs in `app`, `features`, `components`, `infrastructure`, or `lib`.

## Current structure

- `app/`: Next.js routes, layouts, route handlers, and page entry points.
- `features/`: feature-owned UI, clients, services, mappers, models, and types.
- `infrastructure/`: external system clients and environment handling.
- `components/`: current shared UI components that are not yet organized under a `shared/` folder.
- `lib/`: legacy or low-level helpers. Prefer feature or infrastructure placement for new code unless an existing helper clearly belongs here.
- `docs/`: durable project context for humans and agents.

## Feature modules

Current feature modules:

- `features/reservations`: reservation management, available dates, slots, closures, mappers, and reservation UI.
- `features/whatsapp`: WhatsApp conversation viewer, message models, Twilio-backed conversation services, and API response types.

## Placement rules

- Put route composition and server/client boundaries in `app/`.
- Put feature-specific UI and orchestration in the matching `features/<feature>/` folder.
- Put external integration setup in `infrastructure/`.
- Keep presentational components free from direct external API calls.
- Keep DTOs, view models, and mappers close to the feature that owns them.
- Do not move feature-specific code into shared locations until there is real reuse.

## Source of truth

- Project-level rules: `AGENTS.md`
- Next.js entry points: `app/`
- Feature implementations: `features/`
