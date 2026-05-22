# Conversations And Messages Domain

## Purpose

Define how WhatsApp messages are represented in the dashboard.

## When to read this

Read this before changing the WhatsApp viewer, Twilio message mapping, conversation grouping, or message display rules.

## Core concepts

- Message: one Twilio WhatsApp message, normalized into a UI model.
- Conversation: messages grouped by the customer phone number opposite the agent number.
- Agent number: the configured WhatsApp number owned by the bot.
- Direction: `outbound` when the agent number is the sender, otherwise `inbound`.
- Preview: short text derived from the latest message body, media marker, or empty-content marker.

## Current behavior

- Twilio addresses are normalized by removing the `whatsapp:` prefix.
- Only messages where either `from` or `to` belongs to the configured agent WhatsApp number are included.
- Conversation summaries are sorted by latest message timestamp descending.
- Messages inside a selected conversation are sorted by timestamp ascending.
- Multimedia-only messages use a media placeholder in previews.
- Empty messages use an empty-content placeholder.
- The WhatsApp viewer polls for fresh conversation summaries while it is mounted.
- When a conversation is selected, the viewer also polls for that conversation's messages.
- Polling refresh errors do not clear the last successful conversation or message state.

## Dashboard scope

The current WhatsApp dashboard is read-only. It lists conversations and displays message history. It does not send WhatsApp messages.

## Source of truth

- Conversation service: `features/whatsapp/services/conversations.service.ts`
- Conversation model: `features/whatsapp/model/conversation.types.ts`
- Message model: `features/whatsapp/model/message.types.ts`
- Viewer UI: `features/whatsapp/components/whatsapp-viewer.tsx`
