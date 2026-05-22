# Integrations

## Purpose

Summarize the external systems used by the dashboard and where their access is isolated.

## When to read this

Read this before changing API clients, environment variables, backend endpoints, Twilio usage, or auth headers.

## Backend API

The reservation feature talks to the backend through `backendApi`, an Axios instance defined in `infrastructure/http/backend-api.ts`.

Responsibilities:

- Resolve the backend base URL through `infrastructure/http/backend-env.ts`.
- Apply JSON defaults.
- Add internal API token headers when configured.
- Avoid exposing backend credentials or internal headers to browser components.

Known backend areas used by the frontend:

- `bot/reservations`
- `bot/reservations/available-dates`
- `bot/reservations/slots`
- `bot/reservations/closed-days/:date`
- `bot/reservations/closed-slots/:date`
- `bot/reservations/closure-operations/:operationId/failures`

## Twilio

WhatsApp message history is read through Twilio.

Responsibilities:

- Twilio client setup lives in `infrastructure/twilio/twilio-client.ts`.
- Twilio environment parsing lives in `infrastructure/twilio/twilio-env.ts`.
- Message listing, filtering, grouping, and mapping live in `features/whatsapp/services/conversations.service.ts`.
- UI reads normalized conversations and messages through `/api/conversations`.

Current Twilio usage is read-only from the dashboard perspective. The WhatsApp viewer does not send messages.

## Internal API routes

Next.js route handlers under `app/api/` act as browser-safe boundaries. Client components should call these internal routes instead of calling backend or Twilio directly.

## Source of truth

- Backend client: `infrastructure/http/backend-api.ts`
- Twilio client: `infrastructure/twilio/twilio-client.ts`
- Reservation route handlers: `app/api/reservations/`
- Conversation route handlers: `app/api/conversations/`
