# Research: Twilio Message Pagination

## Decision: Use Twilio page reads instead of current list reads

Use the official Twilio SDK `messages.page({ pageSize, pageToken, ...filters })` for bounded server-side reads. The installed SDK exposes `pageSize`, `pageToken`, `dateSentBefore`, `dateSentAfter`, `from`, and `to` on message page options, and page objects expose next/previous page URL metadata.

**Rationale**: The current service uses `messages.list({ limit, pageSize })`, which returns a bounded array but still encourages each endpoint call to rebuild state from the same full recent-message window. `page()` gives the service a natural single-page unit and pagination metadata for `nextCursor`.

**Alternatives considered**:

- Keep `messages.list()` with lower `limit`: simpler, but does not support load-more semantics cleanly.
- Client-side pagination after loading all messages: improves rendering only after the expensive fetch already happened.
- Backend database sync: strongest long-term solution, but outside the requested scope.

## Decision: Return application-owned cursors

Route handlers should accept and return an opaque `cursor`/`nextCursor` owned by this app. Internally, the cursor may encode Twilio page token or next page URL plus scope metadata, but client components should treat it as an opaque string.

**Rationale**: This preserves Twilio isolation and keeps presentational/UI code independent from SDK-specific pagination details.

**Alternatives considered**:

- Expose raw Twilio `pageToken`: leaks integration details into UI state.
- Expose raw Twilio next page URL: risks coupling the browser contract to Twilio URLs and parameters.
- Use only timestamps as cursors: useful for incremental refresh, but less direct for traversing Twilio pages.

## Decision: Build conversation pages by collecting unique conversations from message pages

For `/api/conversations`, request Twilio message pages until enough unique conversation summaries are collected or a bounded scan limit is reached. The response should include the unique conversation summaries and a `nextCursor` when more Twilio pages may produce more conversations.

**Rationale**: Twilio paginates messages, while the UI shows conversations derived by grouping messages by customer phone number. One Twilio page can contain many messages from one customer, so one message page is not equivalent to one conversation page.

**Alternatives considered**:

- Treat one Twilio page as one UI conversation page: fastest but can return far fewer conversations than requested.
- Fetch all pages to compute perfect conversation counts: defeats the performance goal.
- Add persisted conversation index: better at large scale, but out of scope.

## Decision: Load selected conversation messages from newest to older batches

For `/api/conversations/:conversationId`, return the most recent messages first in chronological display order, plus a cursor for older history. The service may need to scan Twilio pages to collect enough messages for the selected conversation because Twilio's account-level message pages are global.

**Rationale**: Employees usually need the latest context first. Older history should be available on demand without blocking initial chat open.

**Alternatives considered**:

- Load all messages for the selected conversation: current behavior and poor for long histories.
- Use only `from` or only `to` filters: misses one side of the WhatsApp conversation unless two filtered reads are merged.
- Require backend conversation storage first: outside current scope.

## Decision: Poll only recent scope

Polling should refresh the recent conversation list and active chat recent messages without re-fetching older pages the user loaded manually. Merge by stable ids to avoid duplicate messages/conversations.

**Rationale**: Polling every 10 seconds should keep current activity fresh, not multiply work by all previously loaded historical pages.

**Alternatives considered**:

- Disable polling after pagination: loses current live-refresh behavior.
- Poll every loaded page: correct but scales poorly with user exploration.
- Implement webhook push updates: a future backend concern, out of scope here.

## Decision: Keep configuration small and explicit

Introduce validated defaults such as conversation page size, message page size, and max Twilio pages scanned per request. Continue validating unsafe env values in `infrastructure/twilio/twilio-env.ts` or a feature-local parser.

**Rationale**: Conversation pages may require scanning multiple Twilio pages. A max scan bound prevents one request from walking too much Twilio history.

**Alternatives considered**:

- No scan cap: risks slow requests on accounts with uneven traffic.
- One global limit only: too coarse because conversation list and chat history have different needs.
