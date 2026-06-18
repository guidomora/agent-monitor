# Implementation Plan: Twilio Message Pagination

**Branch**: `feat/twilio-pagination` | **Date**: 2026-06-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-twilio-message-pagination/spec.md`

## Summary

Optimize WhatsApp - Mensajes loading by replacing the current full recent-message read with bounded, cursor-based pagination backed by Twilio's message pagination. The dashboard will keep Twilio access inside Next.js route handlers and feature services, expose application-owned cursors to the client, load recent conversations/messages first, and let employees request more data on demand.

## Technical Context

**Language/Version**: TypeScript 5, React 19.2.4, Next.js 16.2.3

**Primary Dependencies**: Next.js App Router route handlers, React client components, official `twilio` SDK, existing feature-oriented WhatsApp service and models

**Storage**: N/A. This feature intentionally does not add persistence, database indexing, or backend sync.

**Testing**: `npm run lint`, `npm run build`, focused unit tests for pagination cursor parsing/merging if test setup supports it, manual API verification through route handlers, manual WhatsApp viewer checks

**Target Platform**: Next.js web dashboard used in modern browsers, with Twilio calls executed only on the server side

**Project Type**: Frontend web application with server-side route handlers for external integrations

**Performance Goals**: Initial WhatsApp list and selected-chat load process bounded Twilio pages instead of the full `TWILIO_MESSAGE_LIMIT`; additional data loads happen only on demand; polling does not reload all historical pages already fetched

**Constraints**: Preserve Twilio credential isolation; do not expose raw Twilio page tokens to presentational components; preserve current conversation/message UI models; no persistent storage; no direct Twilio calls from client components

**Scale/Scope**: WhatsApp conversation list endpoint, selected conversation messages endpoint, feature service pagination helpers, API response types, and WhatsApp viewer state/controls for loading more conversations and older messages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution still contains placeholder principles, so no enforceable constitution gates are defined. The plan applies the active repository rules from `AGENTS.md`:

- External Twilio calls stay in infrastructure/service code, never presentational components.
- Raw Twilio DTOs are mapped before reaching UI models.
- The implementation remains feature-oriented under `features/whatsapp`, `app/api/conversations`, and `infrastructure/twilio`.
- The change is scoped to WhatsApp loading behavior and avoids unrelated refactors.
- No unnecessary global state or persistent storage is introduced.
- Loading, empty, and error states must remain explicit.

Gate status: PASS. No violations requiring complexity tracking.

## Project Structure

### Documentation (this feature)

```text
specs/002-twilio-message-pagination/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
`-- contracts/
    `-- whatsapp-pagination-api.md
```

### Source Code (repository root)

```text
app/
`-- api/
    `-- conversations/
        |-- route.ts
        `-- [conversationId]/
            `-- route.ts

features/
`-- whatsapp/
    |-- api/
    |   `-- conversations.api-types.ts
    |-- components/
    |   `-- whatsapp-viewer.tsx
    |-- model/
    |   |-- conversation.types.ts
    |   `-- message.types.ts
    `-- services/
        |-- conversations.service.ts
        `-- server-errors.ts

infrastructure/
`-- twilio/
    |-- twilio-client.ts
    `-- twilio-env.ts
```

**Structure Decision**: Keep pagination behavior inside the existing WhatsApp feature and route handlers. Add small feature-specific cursor/page helpers only if they keep `conversations.service.ts` readable. Do not create a new top-level data layer or shared pagination abstraction unless another feature actually reuses it.

## Phase 0 Research

Research output is captured in [research.md](./research.md). All planning unknowns are resolved:

- Twilio SDK pagination: use `messages.page()`/page metadata for bounded reads instead of `messages.list()` for full bounded lists.
- Cursor ownership: encode application-owned cursors server-side so client code does not depend on raw Twilio token shape.
- Conversation pagination semantics: collect enough Twilio message pages to produce a requested number of unique conversations, with a bounded scan limit.
- Selected chat pagination: start with recent messages and use older-page cursors for loading earlier history.
- Polling: refresh the first/recent page and active conversation recent messages without reloading older pages already fetched manually.

## Phase 1 Design

Design artifacts:

- [data-model.md](./data-model.md): pagination cursor, Twilio page, conversation page, message page, and merge behavior.
- [contracts/whatsapp-pagination-api.md](./contracts/whatsapp-pagination-api.md): route query parameters, response shapes, and behavior contracts.
- [quickstart.md](./quickstart.md): implementation and validation workflow.

## Post-Design Constitution Check

Gate status: PASS.

The design keeps Twilio integration server-side, preserves the existing feature-oriented architecture, maps external data before UI usage, avoids persistent storage, and limits behavior changes to WhatsApp pagination/loading. No complexity tracking entries are required.

## Complexity Tracking

No constitution or architecture violations.
