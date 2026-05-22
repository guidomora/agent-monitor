# Day And Slot Closure Workflow

## Purpose

Explain how the dashboard closes or reopens full days and time slots.

## When to read this

Read this before changing close-day, reopen-day, close-slot, reopen-slot, or closure notification failure behavior.

## Close day flow

1. The operator selects a date in reservation management.
2. If the date is open, the operator can open the close-day modal.
3. Confirming calls `closeReservationDayClient`.
4. The client sends `PUT /api/reservations/closed-days/:date`.
5. The server service calls `bot/reservations/closed-days/:date`.
6. The UI refreshes available dates and reservations for the date.
7. The UI shows either the backend warning or a generated success message.
8. If the backend returns a `closureOperationId`, the UI starts polling for notification failures.

## Reopen day flow

1. If the selected date is closed, the operator can reopen it.
2. The UI calls `reopenReservationDayClient`.
3. The client sends `DELETE /api/reservations/closed-days/:date`.
4. The UI refreshes available dates and reservations for the date.
5. The UI shows a success message or a date loading error if reopening fails.

## Close slot flow

1. The operator selects an open day with enough slot times.
2. The operator opens the slot status modal in close mode.
3. The modal submits `date`, `fromTime`, `toTime`, and `reason`.
4. The client sends `PUT /api/reservations/closed-slots/:date`.
5. The server service calls `bot/reservations/closed-slots/:date`.
6. The UI reloads reservations for the affected date.
7. The UI shows the backend warning or a generated success message.
8. If the backend returns a `closureOperationId`, the UI starts polling for notification failures.

## Reopen slot flow

1. If the selected date has at least one closed slot, the operator can reopen a range.
2. The UI calls `reopenReservationSlotClient`.
3. The client sends `DELETE /api/reservations/closed-slots/:date`.
4. The UI reloads reservations for the affected date.
5. The UI shows how many slot blocks were updated.

## Notification failure polling

After closing a day or slot, the UI may poll `/api/reservations/closure-operations/:operationId/failures`.

Current polling behavior:

- Poll every 2 seconds.
- Stop after about 20 seconds.
- Stop when the operation completes with failures.
- Show failed notification details in a toast.

## Source of truth

- UI orchestration: `features/reservations/components/reservations-manager.tsx`
- Client calls: `features/reservations/api/reservations.client.ts`
- Server service: `features/reservations/api/reservations.service.ts`
- DTOs: `features/reservations/types/reservations.dto.ts`
