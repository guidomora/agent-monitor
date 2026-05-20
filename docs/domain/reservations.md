# Reservations Domain

## Purpose

Define the reservation concepts used by the dashboard.

## When to read this

Read this before changing reservation creation, editing, deletion, day status, slot status, or reservation UI models.

## Core concepts

- Reservation: a booking for a customer on a date and time, with name, phone, service, and party size.
- Available date: a date returned by the backend as manageable by the dashboard.
- Closed day: a date where new reservations should not be accepted from the dashboard until reopened.
- Slot: an hour block returned by the backend with reserved capacity, available capacity, closed status, and optional reason.
- Closed slot: a time range inside an open day where reservations should not be accepted.
- Closure operation: backend operation that may queue customer notifications after closing a day or slot.

## Current DTO fields

Reservation DTOs currently include:

- `date`
- `time`
- `name`
- `phone`
- `service`
- `quantity`

Slot DTOs currently include:

- `time`
- `reserved`
- `available`
- `isClosed`
- `reason`

## UI mapping

Reservation API responses should be mapped before rendering. The main mapper is `features/reservations/mappers/reservations.mapper.ts`.

Current UI models group reservations by normalized hour and combine reservation data with slot capacity and closed-state information.

## Important constraints

- Date strings are treated as calendar dates, usually in `yyyy-mm-dd` format.
- UI date labels use the Argentina timezone and Spanish Argentina formatting where needed.
- Reservation actions should refresh the affected date after a successful mutation.
- Closing a day or slot may return a closure operation id used to check notification failures.

## Source of truth

- DTOs: `features/reservations/types/reservations.dto.ts`
- View models: `features/reservations/types/reservation.view-model.ts`
- Mapper: `features/reservations/mappers/reservations.mapper.ts`
- Manager UI: `features/reservations/components/reservations-manager.tsx`
