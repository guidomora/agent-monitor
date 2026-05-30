# Tasks: Mobile Dashboard Views

**Input**: Design documents from `specs/001-mobile-dashboard-views/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/responsive-ui-contract.md](./contracts/responsive-ui-contract.md), [quickstart.md](./quickstart.md)

**Tests**: No automated test-first tasks were requested. This feature is visual/responsive-only, so validation tasks focus on lint/build plus manual viewport checks.

**Organization**: Tasks are grouped by user story so each story can be implemented and checked independently.

## Phase 1: Setup (Shared Responsive Baseline)

**Purpose**: Confirm current structure and establish the visual-only implementation boundary before editing.

- [X] T001 Review existing responsive CSS and layout classes in app/globals.css
- [X] T002 [P] Review dashboard shell and navigation markup in app/layout.tsx and components/dashboard-nav.tsx
- [X] T003 [P] Review reservations overview markup in features/reservations/components/reservations-overview.tsx
- [X] T004 [P] Review reservation management and modal markup in features/reservations/components/reservations-manager.tsx
- [X] T005 [P] Review WhatsApp viewer responsive markup in features/whatsapp/components/whatsapp-viewer.tsx
- [X] T006 Document implementation guardrails from specs/001-mobile-dashboard-views/quickstart.md before making UI edits

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Apply shared responsive foundations that all user stories depend on.

**CRITICAL**: No user story work should begin until this phase is complete.

- [X] T007 Add mobile-first overflow, viewport, and safe-width safeguards for app shell containers in app/globals.css
- [X] T008 Add responsive typography and spacing constraints for shared cards, headers, panels, buttons, chips, and form controls in app/globals.css
- [X] T009 Update dashboard navigation responsive behavior for phone and tablet widths in components/dashboard-nav.tsx and app/globals.css
- [X] T010 Ensure the app shell preserves current desktop layout while adding phone/tablet breakpoint behavior in app/layout.tsx and app/globals.css
- [X] T011 Verify no data fetching, service, mapper, DTO, route, or business logic files are changed outside visual UI needs using specs/001-mobile-dashboard-views/plan.md

**Checkpoint**: Shared responsive shell is ready and all user stories can build on it.

---

## Phase 3: User Story 1 - Consultar reservas desde celular (Priority: P1) MVP

**Goal**: Employees can consult the daily reservations dashboard from phone-sized screens without zoom, horizontal scrolling, or unreadable cards.

**Independent Test**: Open `/` at 360px and 430px widths, verify metrics, agenda blocks, reservation rows, status chips, loading/error/empty states, and navigation are readable and usable without horizontal scrolling.

### Implementation for User Story 1

- [X] T012 [US1] Make dashboard hero, metric cards, agenda timeline, and reservation rows responsive for phone widths in app/globals.css
- [X] T013 [US1] Adjust reservations overview markup only if required for mobile wrapping and semantic grouping in features/reservations/components/reservations-overview.tsx
- [X] T014 [US1] Ensure reservation row content exposes time, customer, party size, and status without clipping on narrow screens in features/reservations/components/reservations-overview.tsx and app/globals.css
- [X] T015 [US1] Ensure overview loading, empty, and error states remain readable on phone widths in features/reservations/components/reservations-overview.tsx and app/globals.css
- [X] T016 [US1] Validate `/` manually at 360px, 430px, and 1280px using specs/001-mobile-dashboard-views/quickstart.md

**Checkpoint**: User Story 1 is independently usable and testable as the MVP.

---

## Phase 4: User Story 2 - Revisar conversaciones de WhatsApp en mobile (Priority: P2)

**Goal**: Employees can search conversations, select a thread, read messages, and keep chat context on phones and tablets without compressed desktop panes.

**Independent Test**: Open `/whatsapp` at 360px, 430px, 667px, and 768px widths, verify conversation list, search, selected conversation, message bubbles, timestamps, loading/error/empty states, and list/detail navigation are readable and usable.

### Implementation for User Story 2

- [X] T017 [US2] Add mobile-friendly layout behavior for WhatsApp list and conversation detail containers in features/whatsapp/components/whatsapp-viewer.tsx
- [X] T018 [US2] Add responsive CSS for WhatsApp panel heights, scroll regions, message bubbles, timestamps, and long-message wrapping in app/globals.css
- [X] T019 [US2] Ensure WhatsApp search, refresh action, conversation cards, and selected-state styling remain touch-friendly on phone widths in features/whatsapp/components/whatsapp-viewer.tsx and app/globals.css
- [X] T020 [US2] Ensure WhatsApp loading, empty, and error states fit phone and tablet viewports in features/whatsapp/components/whatsapp-viewer.tsx and app/globals.css
- [X] T021 [US2] Validate `/whatsapp` manually at 360px, 430px, 667px, 768px, and 1280px using specs/001-mobile-dashboard-views/quickstart.md

**Checkpoint**: User Story 2 works independently without changing WhatsApp data loading or polling behavior.

---

## Phase 5: User Story 3 - Modificar o revisar detalles operativos en tablet (Priority: P3)

**Goal**: Employees can use reservation management, detail cards, actions, and modals on tablet and phone sizes while preserving the existing desktop workflow.

**Independent Test**: Open `/gestion` at 360px, 430px, 667px, 768px, 1024px, and 1280px widths, verify date controls, create/edit/delete actions, day and slot status actions, reservation cards, modals, busy states, and feedback toasts remain readable and reachable.

### Implementation for User Story 3

- [X] T022 [US3] Make reservation management hero, summary, date toolbar, day status, slot status, metrics, and timeline responsive in app/globals.css
- [X] T023 [US3] Adjust reservation management markup only if required for action grouping, mobile ordering, or tablet readability in features/reservations/components/reservations-manager.tsx
- [X] T024 [US3] Make reservation management cards and action groups wrap or stack without shrinking below touch-friendly sizes in features/reservations/components/reservations-manager.tsx and app/globals.css
- [X] T025 [US3] Make create reservation modal content, fields, footer actions, and viewport scrolling mobile-friendly in features/reservations/components/reservation-create-modal.tsx and app/globals.css
- [X] T026 [US3] Make edit reservation modal summary, loader, select menu, fields, footer actions, and viewport scrolling mobile-friendly in features/reservations/components/reservation-edit-modal.tsx and app/globals.css
- [X] T027 [US3] Make delete reservation modal details and confirmation actions mobile-friendly in features/reservations/components/reservation-delete-modal.tsx and app/globals.css
- [X] T028 [US3] Make day status and slot status modals mobile-friendly in features/reservations/components/reservation-day-status-modal.tsx, features/reservations/components/reservation-slot-status-modal.tsx, and app/globals.css
- [X] T029 [US3] Make dates modal, available date chips, feedback messages, and closure failure toast fit phone/tablet viewports in features/reservations/components/reservations-manager.tsx, features/reservations/components/closure-notification-failure-toast.tsx, and app/globals.css
- [X] T030 [US3] Validate `/gestion` manually at 360px, 430px, 667px, 768px, 1024px, and 1280px using specs/001-mobile-dashboard-views/quickstart.md

**Checkpoint**: User Story 3 is usable on tablets and phones without changing reservation mutation behavior.

---

## Phase 6: Polish & Cross-Cutting Validation

**Purpose**: Confirm all modules, components, and views are responsive, mobile friendly, and desktop-safe.

- [X] T031 Audit all affected pages for horizontal overflow, overlapping content, clipped text, and unusable touch targets using specs/001-mobile-dashboard-views/contracts/responsive-ui-contract.md
- [X] T032 Verify representative viewport coverage for `/`, `/gestion`, and `/whatsapp` at 360px, 430px, 667px, 768px, 1024px, and 1280px using specs/001-mobile-dashboard-views/quickstart.md
- [X] T033 Run lint validation with npm run lint and record outcome in specs/001-mobile-dashboard-views/quickstart.md
- [X] T034 Run production build validation with npm run build and record outcome in specs/001-mobile-dashboard-views/quickstart.md
- [X] T035 Confirm tasks preserve same palette, desktop behavior, routes, API calls, data mapping, and business logic using specs/001-mobile-dashboard-views/plan.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational and is the MVP.
- **User Story 2 (Phase 4)**: Depends on Foundational and can run after or parallel to US1 once shared shell work is complete.
- **User Story 3 (Phase 5)**: Depends on Foundational and can run after or parallel to US1/US2 once shared shell work is complete.
- **Polish (Phase 6)**: Depends on the desired user stories being complete.

### User Story Dependencies

- **US1 Consultar reservas desde celular**: No dependency on US2 or US3.
- **US2 Revisar conversaciones de WhatsApp en mobile**: No dependency on US1 or US3.
- **US3 Modificar o revisar detalles operativos en tablet**: No dependency on US1 or US2, but should reuse shared shell and global responsive foundations.

### Parallel Opportunities

- T002, T003, T004, and T005 can be reviewed in parallel.
- US1, US2, and US3 can be implemented in parallel after T007-T011 if different developers avoid conflicting edits to app/globals.css.
- Component-only adjustments within US3 can run in parallel when they touch different modal files.
- Final validation tasks T031 and T032 can be performed in parallel with separate viewport/page coverage, while T033 and T034 should run after code edits.

---

## Parallel Example: User Story 3

```text
Task: "Make create reservation modal content, fields, footer actions, and viewport scrolling mobile-friendly in features/reservations/components/reservation-create-modal.tsx and app/globals.css"
Task: "Make delete reservation modal details and confirmation actions mobile-friendly in features/reservations/components/reservation-delete-modal.tsx and app/globals.css"
Task: "Make day status and slot status modals mobile-friendly in features/reservations/components/reservation-day-status-modal.tsx, features/reservations/components/reservation-slot-status-modal.tsx, and app/globals.css"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete US1 for `/` phone usability.
3. Validate US1 independently at 360px, 430px, and desktop width.

### Incremental Delivery

1. Ship shared shell and dashboard overview responsiveness.
2. Add WhatsApp responsive improvements.
3. Add reservation management and modal responsive improvements.
4. Run full cross-device validation.

### Constraints During Implementation

- Do not change backend, Twilio, reservation service, mapper, DTO, or route behavior.
- Do not change the color palette.
- Prefer responsive CSS over duplicate mobile components.
- Add separate mobile UI only if the existing layout cannot remain usable across device sizes.
- Keep desktop appearance materially unchanged.
