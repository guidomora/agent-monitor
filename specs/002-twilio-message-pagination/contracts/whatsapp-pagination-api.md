# Contract: WhatsApp Pagination API

## GET `/api/conversations`

Returns a bounded page of WhatsApp conversation summaries derived from Twilio messages.

### Query Parameters

- `limit`: optional positive integer. Defaults to server setting. Clamped by server maximum.
- `cursor`: optional opaque cursor previously returned as `nextCursor`.
- `mode`: optional string. `page` by default; `refresh` may be used by polling to refresh recent scope.

### Success Response

```json
{
  "conversations": [
    {
      "id": "+5491111111111",
      "phoneNumber": "+5491111111111",
      "lastMessagePreview": "Hola, queria reservar...",
      "lastMessageAt": "2026-06-17T15:30:00.000Z",
      "lastMessageStatus": "received",
      "messageCount": 3
    }
  ],
  "nextCursor": "opaque-cursor-or-null",
  "hasMore": true,
  "pageSize": 20
}
```

### Behavior

- First request returns the most recent conversation summaries available within the bounded Twilio scan.
- Subsequent requests with `cursor` continue from the previous scan position.
- Response conversations are unique by `id` and sorted by `lastMessageAt` descending.
- If Twilio pages do not produce enough unique conversations before the scan bound, the response may contain fewer than `limit` conversations.
- `nextCursor` is `null` and `hasMore` is `false` when no further Twilio page is available or the service decides continuation is not safe.

### Error Response

```json
{
  "error": "No se pudo cargar el listado."
}
```

Recommended statuses:

- `400` for invalid `limit` or malformed/incompatible cursor.
- `500` for unexpected server errors.
- Existing Twilio configuration errors keep current friendly messages.

## GET `/api/conversations/{conversationId}`

Returns a bounded page of messages for one normalized WhatsApp conversation.

### Query Parameters

- `limit`: optional positive integer. Defaults to server setting. Clamped by server maximum.
- `cursor`: optional opaque cursor for older messages.
- `direction`: optional string. Defaults to `older` for cursor pagination. Initial request omits cursor and returns recent messages.
- `mode`: optional string. `page` by default; `refresh` may be used by polling to refresh recent scope.

### Success Response

```json
{
  "messages": [
    {
      "id": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "conversationId": "+5491111111111",
      "phoneNumber": "+5491111111111",
      "direction": "inbound",
      "body": "Hola, queria reservar para hoy",
      "sentAt": "2026-06-17T15:30:00.000Z",
      "status": "received",
      "mediaCount": 0
    }
  ],
  "nextCursor": "opaque-cursor-or-null",
  "hasMore": true,
  "pageSize": 30
}
```

### Behavior

- Initial request returns recent messages for the selected conversation in chronological ascending order.
- Requests with `cursor` return older messages in chronological ascending order.
- The client prepends older pages and deduplicates by `id`.
- Polling refreshes recent messages and merges by `id`; it must not discard older pages loaded manually.
- `nextCursor` is scoped to the `conversationId`; using it for another conversation returns `400`.

### Error Response

```json
{
  "error": "No se pudo cargar la conversacion."
}
```

Recommended statuses:

- `400` for invalid `limit`, malformed cursor, or cursor/conversation mismatch.
- `500` for unexpected server errors.
- Existing Twilio configuration errors keep current friendly messages.

## Client Merge Contract

- Conversation merge key: `conversation.id`.
- Message merge key: `message.id`.
- Conversation list order after merge: `lastMessageAt` descending.
- Message list order after merge: `sentAt` ascending.
- Load-more errors do not clear previously loaded data.
- Initial-load errors may keep existing current behavior for empty states.
