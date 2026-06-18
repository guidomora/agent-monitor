# Quickstart: Twilio Message Pagination

## Implementation Steps

1. Extend WhatsApp API response types in `features/whatsapp/api/conversations.api-types.ts` with:
   - `nextCursor: string | null`
   - `hasMore: boolean`
   - `pageSize: number`

2. Add server-side pagination settings and validation:
   - conversation page size default
   - message page size default
   - Twilio raw page size default
   - max Twilio pages scanned per dashboard request

3. Replace `listWhatsappMessages()` in `features/whatsapp/services/conversations.service.ts` with page-oriented helpers:
   - fetch one Twilio message page
   - encode/decode app-owned cursors
   - normalize/filter WhatsApp messages
   - collect unique conversation summaries up to requested limit
   - collect selected-conversation messages up to requested limit

4. Update route handlers:
   - `app/api/conversations/route.ts` reads `limit`, `cursor`, and optional `mode`.
   - `app/api/conversations/[conversationId]/route.ts` reads `limit`, `cursor`, and optional `mode`.
   - Both return the paginated response contract.

5. Update `WhatsAppViewer`:
   - store conversation `nextCursor` and loading-more state.
   - add load-more control for conversations.
   - store selected conversation older-message cursor and loading-more state.
   - add load-older control near the top of the message viewport.
   - merge by ids and preserve sort order.
   - keep polling focused on recent scope and avoid clearing older loaded messages.

6. Update docs if implementation semantics differ from the planned contract.

## Validation

Run:

```bash
npm run lint
npm run build
```

Manual checks:

- Open WhatsApp - Mensajes and confirm the first load returns a bounded page.
- Load more conversations and confirm no duplicate conversations appear.
- Open a conversation with enough history and confirm only recent messages load first.
- Load older messages and confirm they prepend in chronological order.
- Leave polling active and confirm older loaded messages are not discarded.
- Test errors for load-more requests by simulating a failed API call and confirming existing data remains visible.

## Notes

- This feature improves load behavior without guaranteeing perfect all-time conversation counts, because conversations are derived from paged Twilio messages.
- A future backend sync/database would be the correct next step if the product needs fast global historical search, exact message counts, or analytics over all conversations.
