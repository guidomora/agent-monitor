# Message Sync Workflow

## Purpose

Explain how WhatsApp conversations and messages are loaded into the dashboard.

## When to read this

Read this before changing Twilio message fetching, conversation grouping, WhatsApp route handlers, or the WhatsApp viewer loading states.

## Conversation list flow

1. `WhatsAppViewer` mounts.
2. The component requests `/api/conversations?limit=20` with `cache: no-store`.
3. The route handler parses `limit`, optional `cursor`, and optional `mode`.
4. The route handler calls the WhatsApp conversation service.
5. The service reads bounded Twilio message pages with the SDK pagination API.
6. The service filters messages to WhatsApp messages involving the configured agent number.
7. Messages are normalized into UI message models.
8. Messages are grouped by customer phone number.
9. The UI receives sorted conversation summaries, `nextCursor`, and `hasMore`.
10. When the operator loads more chats, the component calls `/api/conversations?limit=20&cursor=...`.
11. While the viewer remains mounted, the component polls `/api/conversations?limit=20&mode=refresh` every 10 seconds.

## Selected conversation flow

1. The operator selects a conversation.
2. The component requests `/api/conversations/:conversationId?limit=30`.
3. The service reads bounded Twilio message pages with the SDK pagination API.
4. Messages are filtered to the normalized selected conversation id.
5. Messages are sorted oldest to newest.
6. The UI renders recent chat-style message bubbles and scrolls the viewport to the bottom.
7. When the operator loads older messages, the component calls `/api/conversations/:conversationId?limit=30&cursor=...`.
8. While a conversation remains selected, polling refreshes `/api/conversations/:conversationId?limit=30&mode=refresh`.

## Polling behavior

- Polling is owned by `WhatsAppViewer` and runs only while the component is mounted.
- The interval is defined by `POLLING_INTERVAL_MS`.
- The implementation uses a `setTimeout` loop that schedules the next tick after the current one completes, avoiding overlapping polling cycles.
- Each polling tick refreshes the recent conversation page and, when available, the selected conversation's recent messages.
- Polling does not request older pages loaded manually by the operator.
- Refresh results are merged by stable ids so previously loaded older messages stay visible.
- Cleanup clears the pending timer and aborts the in-flight polling request controller.
- A selected conversation ref prevents stale message responses from replacing the currently active chat after a selection change.

## Search and refresh

- Search is local to the loaded conversation summaries.
- Search matches customer phone number or last message preview.
- Manual refresh reloads the conversation list from `/api/conversations`.
- Manual refresh remains available as a fallback even with automatic polling enabled.
- Polling refreshes do not reset the local search input or selected conversation.
- Search only covers the conversations already loaded into the browser.

## Scroll behavior

- Selecting a conversation scrolls the message viewport to the bottom.
- Loading older messages preserves the current viewport position after prepending the older page.
- Polling keeps the viewport pinned to the bottom only when the operator is already near the bottom.
- If the operator scrolls up to read older messages, polling does not force the viewport back down.

## Failure behavior

- Conversation list errors are shown in the left panel.
- Selected conversation errors are shown in the message panel.
- Load-more errors are shown inline and do not clear already loaded data.
- Aborted requests are ignored to avoid stale error states during unmounts or selection changes.
- Polling errors are non-blocking when previous data exists; the UI keeps showing the last successful data and displays a small refresh warning.

## Pagination notes

- Twilio paginates messages, not the conversation summaries shown by the dashboard.
- Conversation summaries are still derived by grouping normalized Twilio messages by customer phone number.
- A single Twilio page can contain many messages from one customer and fewer unique conversations than the requested UI limit.
- The API returns application-owned opaque cursors; client components must not parse Twilio page tokens or URLs.
- Without a backend message index, counts and historical search are limited to the scanned Twilio pages.

## Source of truth

- Viewer UI: `features/whatsapp/components/whatsapp-viewer.tsx`
- Conversation service: `features/whatsapp/services/conversations.service.ts`
- API types: `features/whatsapp/api/conversations.api-types.ts`
- Twilio client: `infrastructure/twilio/twilio-client.ts`
