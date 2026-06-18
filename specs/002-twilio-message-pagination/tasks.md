# Tasks: Twilio Message Pagination

**Input**: Design documents from `specs/002-twilio-message-pagination/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/whatsapp-pagination-api.md](./contracts/whatsapp-pagination-api.md), [quickstart.md](./quickstart.md)

**Tests**: Automated test tasks are not mandatory for this feature because TDD was not requested. Validation is covered by final lint/build and manual API/UI checks from quickstart.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches a different file and has no dependency on incomplete tasks.
- **[Story]**: User story label for story phases only.
- Every task includes an exact file path.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add shared API types and server-side settings needed by all paginated endpoints.

- [X] T001 [P] Extend paginated response types for conversations and messages in `features/whatsapp/api/conversations.api-types.ts`
- [X] T002 [P] Add validated WhatsApp pagination settings defaults in `infrastructure/twilio/twilio-env.ts`
- [X] T003 [P] Add pagination validation error mapping for user-friendly API responses in `features/whatsapp/services/server-errors.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build reusable server-side pagination primitives before implementing any user story.

**CRITICAL**: No user story work should begin until this phase is complete.

- [X] T004 Create opaque cursor encode/decode helpers scoped by endpoint in `features/whatsapp/services/conversation-pagination-cursor.ts`
- [X] T005 Create limit/cursor query parsing helpers for route handlers in `features/whatsapp/services/conversation-pagination-params.ts`
- [X] T006 Refactor existing WhatsApp message normalization helpers for reuse by paginated collectors in `features/whatsapp/services/conversations.service.ts`
- [X] T007 Replace the current full-window `listWhatsappMessages()` dependency with a Twilio `messages.page()` helper in `features/whatsapp/services/conversations.service.ts`

**Checkpoint**: Server-side pagination primitives are available and Twilio remains isolated from client components.

---

## Phase 3: User Story 1 - Cargar conversaciones recientes rapidamente (Priority: P1) MVP

**Goal**: `/api/conversations?limit=20` returns a bounded page of recent conversation summaries and supports loading more with an app-owned `nextCursor`.

**Independent Test**: Open WhatsApp - Mensajes and verify the first response is bounded, returns `nextCursor`/`hasMore` when applicable, and the UI can load more conversations without duplicates.

### Implementation for User Story 1

- [X] T008 [US1] Implement paginated conversation summary collection from Twilio pages in `features/whatsapp/services/conversations.service.ts`
- [X] T009 [US1] Update `getConversationSummaries()` to accept `limit` and `cursor` options and return `conversations`, `nextCursor`, `hasMore`, and `pageSize` in `features/whatsapp/services/conversations.service.ts`
- [X] T010 [US1] Update `/api/conversations` to parse `limit`, `cursor`, and `mode` query params in `app/api/conversations/route.ts`
- [X] T011 [US1] Update `WhatsAppViewer` conversation state to store `conversationsNextCursor`, `hasMore`, and load-more errors in `features/whatsapp/components/whatsapp-viewer.tsx`
- [X] T012 [US1] Add a load-more conversations action that calls `/api/conversations?limit=20&cursor=...` and merges by conversation id in `features/whatsapp/components/whatsapp-viewer.tsx`
- [X] T013 [US1] Render a load-more conversations control and end-of-list state in the chat sidebar in `features/whatsapp/components/whatsapp-viewer.tsx`

**Checkpoint**: User Story 1 works independently as the first useful change: recent conversations load first, more conversations load on demand, and Twilio page tokens are not exposed to UI code.

---

## Phase 4: User Story 2 - Cargar mensajes de un chat por lotes (Priority: P1)

**Goal**: Selecting a conversation loads only recent messages first, with an option to load older messages using the same app-owned cursor pattern.

**Independent Test**: Select a conversation with long history, confirm only a recent page renders initially, then load older messages and verify they prepend in chronological order without duplicates.

### Implementation for User Story 2

- [X] T014 [US2] Implement selected-conversation message page collection from Twilio pages in `features/whatsapp/services/conversations.service.ts`
- [X] T015 [US2] Update `getConversationMessages()` to accept `limit`, `cursor`, and `mode` options and return `messages`, `nextCursor`, `hasMore`, and `pageSize` in `features/whatsapp/services/conversations.service.ts`
- [X] T016 [US2] Update `/api/conversations/[conversationId]` to parse `limit`, `cursor`, `direction`, and `mode` query params in `app/api/conversations/[conversationId]/route.ts`
- [X] T017 [US2] Update selected conversation message state to store `olderMessagesNextCursor`, `hasMoreOlderMessages`, and load-older errors in `features/whatsapp/components/whatsapp-viewer.tsx`
- [X] T018 [US2] Add a load-older messages action that calls `/api/conversations/:conversationId?cursor=...` and prepends messages by message id in `features/whatsapp/components/whatsapp-viewer.tsx`
- [X] T019 [US2] Render a load-older messages control near the top of the message viewport in `features/whatsapp/components/whatsapp-viewer.tsx`
- [X] T020 [US2] Preserve scroll position when older messages are prepended in `features/whatsapp/components/whatsapp-viewer.tsx`

**Checkpoint**: User Story 2 works independently for selected chats: recent messages load first and older history is opt-in.

---

## Phase 5: User Story 3 - Mantener refresco operativo sin recargar historial innecesario (Priority: P2)

**Goal**: Polling refreshes only recent scope and does not reload or discard historical pages loaded manually.

**Independent Test**: Leave WhatsApp - Mensajes open with extra conversations or older messages loaded, wait for polling, and confirm loaded historical data remains visible while recent updates merge without duplicates.

### Implementation for User Story 3

- [X] T021 [US3] Add `mode=refresh` handling for recent conversation refresh without cursor continuation in `app/api/conversations/route.ts`
- [X] T022 [US3] Add `mode=refresh` handling for active conversation recent-message refresh in `app/api/conversations/[conversationId]/route.ts`
- [X] T023 [US3] Update polling conversation refresh to call the recent page only and merge by conversation id in `features/whatsapp/components/whatsapp-viewer.tsx`
- [X] T024 [US3] Update polling message refresh to merge recent messages without clearing older loaded pages in `features/whatsapp/components/whatsapp-viewer.tsx`
- [X] T025 [US3] Keep non-blocking polling and load-more error states from clearing existing data in `features/whatsapp/components/whatsapp-viewer.tsx`

**Checkpoint**: Polling remains operational but no longer scales with every historical page loaded by the employee.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, validation, and cleanup across all user stories.

- [X] T026 [P] Update WhatsApp message sync documentation with pagination behavior and limitations in `docs/workflows/message-sync.md`
- [X] T027 [P] Update environment variable documentation for pagination settings in `README.md`
- [X] T028 Review TypeScript imports and remove dead code left from `listWhatsappMessages()` in `features/whatsapp/services/conversations.service.ts`
- [X] T029 Run `npm run lint` from `package.json` and fix any reported issues in affected WhatsApp files
- [X] T030 Run `npm run build` from `package.json` and fix any reported type or build errors in affected WhatsApp files
- [ ] T031 Validate quickstart manual scenarios and record any semantic deviations in `specs/002-twilio-message-pagination/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational. This is the MVP.
- **User Story 2 (Phase 4)**: Depends on Foundational and can start after US1 server pagination patterns are established.
- **User Story 3 (Phase 5)**: Depends on US1 and US2 because polling must merge with both paginated conversation and message state.
- **Polish (Phase 6)**: Depends on desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: First deliverable; no dependency on US2 or US3 after Foundation.
- **US2 (P1)**: Can be implemented after Foundation, but should follow US1 to reuse the cursor/route pattern.
- **US3 (P2)**: Depends on US1 and US2 client merge behavior.

### Within Each User Story

- Service pagination before route handler changes.
- Route handler contract before client integration.
- Client state before UI controls.
- Merge/deduplication before polling changes.

---

## Parallel Opportunities

- T001, T002, and T003 can run in parallel.
- T026 and T027 can run in parallel after implementation behavior is known.
- US1 and US2 service work both touch `features/whatsapp/services/conversations.service.ts`, so they should be sequenced unless split into helper files first.
- Most `WhatsAppViewer` tasks touch the same file, so they should be sequenced to avoid conflicts.

## Parallel Example: Setup

```bash
Task: "Extend paginated response types for conversations and messages in features/whatsapp/api/conversations.api-types.ts"
Task: "Add validated WhatsApp pagination settings defaults in infrastructure/twilio/twilio-env.ts"
Task: "Add pagination validation error mapping for user-friendly API responses in features/whatsapp/services/server-errors.ts"
```

## Parallel Example: Polish

```bash
Task: "Update WhatsApp message sync documentation with pagination behavior and limitations in docs/workflows/message-sync.md"
Task: "Update environment variable documentation for pagination settings in README.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate `/api/conversations?limit=20` plus load-more conversations.
5. Demo the optimized initial conversation list before adding selected-chat pagination.

### Incremental Delivery

1. Setup + Foundation: cursor contract and Twilio page helper.
2. US1: bounded conversation list with `nextCursor` and load-more UI.
3. US2: bounded selected-chat messages with load-older UI.
4. US3: polling refreshes recent scope without discarding loaded history.
5. Polish: docs, lint, build, and quickstart validation.

### Scope Guardrails

- Do not add persistent storage or backend database sync in this feature.
- Do not call Twilio from client components.
- Do not expose Twilio `pageToken` or raw page URLs to `WhatsAppViewer`.
- Keep conversations derived from Twilio messages and document the limitation that this is not a native Twilio conversation index.
