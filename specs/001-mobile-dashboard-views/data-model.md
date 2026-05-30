# Data Model: Mobile Dashboard Views

This feature does not introduce new persisted data, API payloads, or business entities. The model below documents the existing user-facing entities and responsive UI expectations that implementation must preserve.

## Employee

**Description**: Restaurant staff member using the dashboard during operations.

**Relevant fields**:

- Current section: dashboard, reservation management, or WhatsApp conversations.
- Current device context: phone, tablet, or desktop.
- Current task: consult, review, create, edit, delete, close/reopen day or slot, or read conversation.

**Rules**:

- The employee must be able to complete existing tasks without new permissions or changed workflows.
- Touch targets must remain usable on phone and tablet.

## Device Context

**Description**: The available viewport and input context for the same web dashboard.

**Relevant fields**:

- Width category: phone, tablet, desktop.
- Orientation: portrait or landscape where relevant.
- Input mode: touch-first for phone/tablet, pointer-friendly for desktop.

**Rules**:

- Phone views must avoid mandatory horizontal scrolling.
- Tablet views should use available space without showing a cramped desktop layout.
- Desktop views must remain visually and functionally consistent with the current product.

## Reservation

**Description**: Existing booking record shown in overview and management screens.

**Relevant fields**:

- Customer name/contact.
- Date and time.
- Party size.
- Status.
- Notes or operational details.
- Available actions based on existing business rules.

**Rules**:

- Mobile summaries must expose date/time, customer, party size, and status.
- Detail and action access must remain clear without changing action behavior.
- Long names or notes must wrap without covering actions or status.

## Conversation

**Description**: Existing WhatsApp thread with a customer.

**Relevant fields**:

- Conversation identifier.
- Phone number.
- Last message preview.
- Message list.
- Message timestamp and direction.

**Rules**:

- Conversation list and message detail must be readable on mobile.
- A selected conversation must be reachable without losing the ability to return to the list.
- Message bubbles must wrap long content and preserve sender context.

## Dashboard Metric

**Description**: Existing operational summary value displayed in dashboard cards.

**Relevant fields**:

- Label.
- Value.
- Detail.
- Optional suffix or status tone.

**Rules**:

- Metrics must remain scannable on small screens.
- Card layout must not create overflow or unreadable values.

## UI State

**Description**: Existing loading, error, empty, selected, busy, and modal states.

**Relevant fields**:

- Loading state.
- Error message.
- Empty state.
- Selected date/conversation/reservation.
- Open modal or feedback toast.
- Pending action.

**Rules**:

- Responsive changes must preserve existing state transitions.
- Modal and toast states must fit phone and tablet viewports.
- Busy states must not hide critical context or create inaccessible controls.
