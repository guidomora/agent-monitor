# Implementation Plan: Mobile Dashboard Views

**Branch**: `001-mobile-dashboard-views` | **Date**: 2026-05-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-mobile-dashboard-views/spec.md`

## Summary

Adapt the existing restaurant operations dashboard so reservations, reservation management, WhatsApp conversations, navigation, modals, and feedback states remain usable from phone-sized screens through tablets and desktop. The implementation approach is visual and responsive-first: preserve existing data flow, business behavior, actions, routes, palette, and desktop experience while improving layout, spacing, touch targets, text wrapping, and viewport handling across the current UI.

## Technical Context

**Language/Version**: TypeScript 5, React 19.2.4, Next.js 16.2.3

**Primary Dependencies**: Next.js App Router, React, Tailwind CSS 4 via global CSS, axios, existing Twilio/backend integration clients

**Storage**: N/A. This feature must not add storage or change data persistence.

**Testing**: `npm run lint`, `npm run build`, manual responsive verification in browser/device emulation across phone, tablet, and desktop widths

**Target Platform**: Responsive web dashboard used in modern mobile, tablet, and desktop browsers

**Project Type**: Frontend web application

**Performance Goals**: Existing pages remain responsive during scrolling and interaction; mobile views avoid layout shifts, blocking overflow, and expensive render changes for large chat or reservation lists.

**Constraints**: Visual/responsive change only; no business logic changes; no API contract changes; no palette change; preserve current desktop layout and behavior; prefer responsive layouts over separate mobile views unless a single layout creates a poor mobile workflow.

**Scale/Scope**: Current dashboard shell, daily reservations overview, reservation management screen and modals, WhatsApp conversations viewer, navigation, loading/error/empty states, and representative phone/tablet/desktop viewport checks.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution still contains placeholder principles, so no enforceable constitution gates are defined. The plan instead applies the active repository rules from `AGENTS.md`:

- Preserve current behavior unless explicitly required.
- Keep UI components focused on presentation.
- Keep data fetching, mapping, and orchestration outside presentational changes.
- Reuse existing feature-oriented structure and styling conventions.
- Touch the smallest set of files needed.
- Do not introduce unnecessary global state or new API/data layers.

Gate status: PASS. No violations requiring complexity tracking.

## Project Structure

### Documentation (this feature)

```text
specs/001-mobile-dashboard-views/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- responsive-ui-contract.md
|-- checklists/
|   `-- requirements.md
`-- spec.md
```

### Source Code (repository root)

```text
app/
|-- globals.css
|-- layout.tsx
|-- page.tsx
|-- gestion/page.tsx
`-- whatsapp/page.tsx

components/
`-- dashboard-nav.tsx

features/
|-- reservations/
|   `-- components/
|       |-- reservations-overview.tsx
|       |-- reservations-manager.tsx
|       |-- reservation-create-modal.tsx
|       |-- reservation-edit-modal.tsx
|       |-- reservation-delete-modal.tsx
|       |-- reservation-day-status-modal.tsx
|       `-- reservation-slot-status-modal.tsx
`-- whatsapp/
    `-- components/
        `-- whatsapp-viewer.tsx
```

**Structure Decision**: Keep changes in the existing app shell, global responsive styles, and feature components that already render the affected screens. Do not create new top-level folders. Create feature-specific mobile components only if responsive CSS cannot keep a workflow usable without compromising desktop.

## Phase 0 Research

Research output is captured in [research.md](./research.md). All planning unknowns are resolved:

- Responsive strategy: responsive-first, separate mobile views only for materially different workflows.
- Desktop preservation: use additive breakpoint styles and verify desktop before/after.
- Palette: keep existing CSS custom properties and status colors.
- Logic boundary: no data fetching, API, mapper, or mutation changes.
- Verification: lint/build plus viewport-focused manual checks.

## Phase 1 Design

Design artifacts:

- [data-model.md](./data-model.md): UI/domain entities and responsive state expectations, with no storage changes.
- [contracts/responsive-ui-contract.md](./contracts/responsive-ui-contract.md): user-facing responsive UI contract for shell, reservations, management, WhatsApp, modals, and states.
- [quickstart.md](./quickstart.md): implementation and validation workflow.

## Post-Design Constitution Check

Gate status: PASS.

The design remains within the current frontend architecture, adds no new business capabilities, introduces no backend/API changes, and keeps the implementation scoped to visual responsiveness. No complexity tracking entries are required.

## Complexity Tracking

No constitution or architecture violations.
