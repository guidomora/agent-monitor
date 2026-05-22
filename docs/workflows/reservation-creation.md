# Reservation Creation Workflow

## Purpose

Explain how a reservation is created from the dashboard.

## When to read this

Read this before changing the create reservation modal, create request payload, success refresh behavior, or validation/error handling around creation.

## Trigger

An operator opens the reservation management screen and starts a new reservation from the selected day.

## Current flow

1. `ReservationsManager` loads available dates and the selected date agenda.
2. The create modal opens with an initial date selected from the current open date when possible.
3. The modal submits a `CreateReservationRequestDto`.
4. `createReservationClient` posts to `/api/reservations`.
5. The route handler calls the reservation service.
6. The reservation service posts to the backend endpoint `bot/reservations`.
7. On success, the modal closes and the UI shows the backend success message.
8. If the created reservation belongs to a different date than the current selection, the UI switches to that date.
9. If the created reservation belongs to the selected date, the UI reloads reservations for that date.

## Failure behavior

- Client wrappers parse API error payloads when possible.
- The create modal receives and displays a user-facing error message.
- The modal remains open after a failed create request.

## Source of truth

- UI orchestration: `features/reservations/components/reservations-manager.tsx`
- Client call: `features/reservations/api/reservations.client.ts`
- Server service: `features/reservations/api/reservations.service.ts`
- DTOs: `features/reservations/types/reservations.dto.ts`
