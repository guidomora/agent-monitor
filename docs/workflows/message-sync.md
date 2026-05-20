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

## Selected conversation flow

1. The operator selects a conversation.
2. The component requests `/api/conversations/:conversationId`.
3. The service lists and normalizes Twilio messages again.
4. Messages are filtered to the normalized selected conversation id.
5. Messages are sorted oldest to newest.
6. The UI renders chat-style message bubbles and scrolls the viewport to the bottom.

## Search and refresh

- Search is local to the loaded conversation summaries.
- Search matches customer phone number or last message preview.
- Manual refresh reloads the conversation list from `/api/conversations`.

## Failure behavior

- Conversation list errors are shown in the left panel.
- Selected conversation errors are shown in the message panel.
- Aborted requests are ignored to avoid stale error states during unmounts or selection changes.

## Source of truth

- Viewer UI: `features/whatsapp/components/whatsapp-viewer.tsx`
- Conversation service: `features/whatsapp/services/conversations.service.ts`
- API types: `features/whatsapp/api/conversations.api-types.ts`
- Twilio client: `infrastructure/twilio/twilio-client.ts`
