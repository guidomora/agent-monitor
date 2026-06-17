# Data Model: Twilio Message Pagination

## TwilioMessagePage

Raw page returned by the Twilio SDK message resource.

Fields:

- `instances`: raw Twilio message instances for one page.
- `nextPageUrl`: optional Twilio URL for the next page.
- `previousPageUrl`: optional Twilio URL for the previous page.

Validation rules:

- Must stay inside server-side service code.
- Must be filtered to WhatsApp messages involving the configured agent number before mapping to UI models.

## PaginationCursor

Opaque application-owned cursor exchanged between the dashboard API and client.

Fields:

- `value`: encoded string returned as `nextCursor`.
- Internal payload may include Twilio page token/URL, request scope, direction, and scan metadata.

Validation rules:

- Client components must not parse cursor contents.
- Server must reject malformed or incompatible cursors with a controlled 400 response.
- Cursor scope must match the endpoint and conversation id where it is used.

## ConversationSummaryPage

Response model for a page of conversations.

Fields:

- `conversations`: `ConversationSummary[]`.
- `nextCursor`: `string | null`.
- `hasMore`: `boolean`.
- `pageSize`: number used for the requested UI page.

Relationships:

- Each `ConversationSummary` is derived from one or more normalized `ConversationMessage` records.
- `nextCursor` points to the next Twilio scan position, not necessarily exactly the next UI row offset.

Validation rules:

- Conversations must be unique by `id`.
- Conversations must be sorted by `lastMessageAt` descending.
- `messageCount` may represent count within the scanned scope, not a guaranteed all-time total unless all history has been scanned.

## ConversationMessagePage

Response model for a page of messages in a selected conversation.

Fields:

- `messages`: `ConversationMessage[]`.
- `nextCursor`: `string | null` for older history.
- `hasMore`: `boolean`.
- `pageSize`: number used for the requested UI page.

Relationships:

- All messages belong to the requested normalized `conversationId`.

Validation rules:

- Messages must be unique by Twilio message SID.
- Messages must be returned in chronological ascending order for chat rendering.
- Initial load returns recent messages; loading more prepends older messages in the UI.

## WhatsAppPaginationSettings

Server-side settings for page sizes and scan bounds.

Fields:

- `conversationPageSize`: default number of conversation summaries requested by the UI.
- `messagePageSize`: default number of messages requested for a selected chat.
- `twilioPageSize`: number of raw Twilio messages requested per Twilio page.
- `maxTwilioPagesPerRequest`: upper bound on Twilio pages scanned to satisfy one dashboard request.

Validation rules:

- All values must be positive integers.
- Page sizes should be clamped to safe minimum/maximum values.
- `maxTwilioPagesPerRequest` prevents slow requests when many Twilio pages contain irrelevant or duplicate conversation data.

## ClientPaginationState

UI state owned by `WhatsAppViewer`.

Fields:

- `conversations`: loaded conversation summaries.
- `conversationsNextCursor`: cursor for loading more conversations.
- `isLoadingMoreConversations`: load-more state.
- `messages`: loaded messages for selected conversation.
- `olderMessagesNextCursor`: cursor for loading older selected-chat messages.
- `isLoadingOlderMessages`: load-more state.

State transitions:

- Initial conversation load replaces conversation state and stores the returned cursor.
- Load-more conversation request merges by conversation id and updates the cursor.
- Selecting a conversation resets message state and loads its recent message page.
- Loading older messages prepends by message id while preserving chronological order.
- Polling refreshes recent scope and merges by stable ids without clearing older loaded history.
