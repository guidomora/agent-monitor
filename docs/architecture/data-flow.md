# Data Flow

## Purpose

Document the expected path from external systems to rendered UI.

## When to read this

Read this before adding or changing data fetching, route handlers, client fetch wrappers, mappers, or UI state around async data.

## Standard flow

The preferred flow is:

```text
external system
-> infrastructure client
-> feature server service
-> app/api route handler
-> feature client wrapper
-> feature component state
-> presentational UI
```

This keeps external system details out of UI components and keeps API error handling centralized enough to be maintainable.

## Backend reservation flow

- Server-side backend access uses `infrastructure/http/backend-api.ts`.
- Reservation server calls live in `features/reservations/api/reservations.service.ts`.
- Browser-facing calls go through route handlers under `app/api/reservations/`.
- Client components call wrappers in `features/reservations/api/*.client.ts`.
- Backend DTOs are mapped into UI-facing models by `features/reservations/mappers/reservations.mapper.ts`.

## WhatsApp conversation flow

- Twilio setup lives in `infrastructure/twilio/`.
- Twilio-backed conversation logic lives in `features/whatsapp/services/conversations.service.ts`.
- Browser-facing calls go through route handlers under `app/api/conversations/`.
- `features/whatsapp/components/whatsapp-viewer.tsx` fetches from internal API routes, not from Twilio directly.

## Error handling expectations

- Services should convert external failures into useful domain or client errors.
- UI should show loading, empty, and error states explicitly.
- Technical details should stay in service logs or debug paths, not in user-facing copy.

## Source of truth

- Backend HTTP client: `infrastructure/http/backend-api.ts`
- Reservation services: `features/reservations/api/`
- WhatsApp services: `features/whatsapp/services/`
- Route handlers: `app/api/`
