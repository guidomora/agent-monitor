# Customers Domain

## Purpose

Define how customers are represented indirectly through reservations and conversations.

## When to read this

Read this before adding customer-specific views, linking reservations to conversations, or introducing customer identity rules.

## Current representation

There is no standalone customer aggregate in the frontend today. Customers are represented through:

- Reservation fields such as `name` and `phone`.
- WhatsApp conversations grouped by phone number.

The phone number is the practical link between reservation data and WhatsApp message history.

## Current constraints

- The frontend does not currently own customer deduplication rules.
- The frontend does not currently maintain a customer profile model.
- Any future customer feature should define whether the backend or frontend owns identity normalization.

## Source of truth

- Reservation DTOs: `features/reservations/types/reservations.dto.ts`
- Conversation models: `features/whatsapp/model/`
- WhatsApp grouping: `features/whatsapp/services/conversations.service.ts`
