# Message Sync Workflow

## Purpose

Explain how WhatsApp conversations and messages are loaded into the dashboard.

## When to read this

Read this before changing Twilio message fetching, conversation grouping, WhatsApp route handlers, or the WhatsApp viewer loading states.

## Conversation list flow

1. `WhatsAppViewer` mounts.
2. The component requests `/api/conversations` with `cache: no-store`.
3. The route handler calls the WhatsApp conversation service.
4. The service lists recent Twilio messages using the configured message limit.
5. The service filters messages to WhatsApp messages involving the configured agent number.
6. Messages are normalized into UI message models.
7. Messages are grouped by customer phone number.
8. The UI receives sorted conversation summaries and renders the conversation list.
9. While the viewer remains mounted, the component polls `/api/conversations` every 10 seconds.

## Selected conversation flow

1. The operator selects a conversation.
2. The component requests `/api/conversations/:conversationId`.
3. The service lists and normalizes Twilio messages again.
4. Messages are filtered to the normalized selected conversation id.
5. Messages are sorted oldest to newest.
6. The UI renders chat-style message bubbles and scrolls the viewport to the bottom.
7. While a conversation remains selected, polling also refreshes `/api/conversations/:conversationId`.

## Polling behavior

- Polling is owned by `WhatsAppViewer` and runs only while the component is mounted.
- The interval is defined by `POLLING_INTERVAL_MS`.
- The implementation uses a `setTimeout` loop that schedules the next tick after the current one completes, avoiding overlapping polling cycles.
- Each polling tick refreshes the conversation list and, when available, the selected conversation messages.
- Cleanup clears the pending timer and aborts the in-flight polling request controller.
- A selected conversation ref prevents stale message responses from replacing the currently active chat after a selection change.

## Search and refresh

- Search is local to the loaded conversation summaries.
- Search matches customer phone number or last message preview.
- Manual refresh reloads the conversation list from `/api/conversations`.
- Manual refresh remains available as a fallback even with automatic polling enabled.
- Polling refreshes do not reset the local search input or selected conversation.

## Scroll behavior

- Selecting a conversation scrolls the message viewport to the bottom.
- Polling keeps the viewport pinned to the bottom only when the operator is already near the bottom.
- If the operator scrolls up to read older messages, polling does not force the viewport back down.

## Failure behavior

- Conversation list errors are shown in the left panel.
- Selected conversation errors are shown in the message panel.
- Aborted requests are ignored to avoid stale error states during unmounts or selection changes.
- Polling errors are non-blocking when previous data exists; the UI keeps showing the last successful data and displays a small refresh warning.

## Source of truth

- Viewer UI: `features/whatsapp/components/whatsapp-viewer.tsx`
- Conversation service: `features/whatsapp/services/conversations.service.ts`
- API types: `features/whatsapp/api/conversations.api-types.ts`
- Twilio client: `infrastructure/twilio/twilio-client.ts`
