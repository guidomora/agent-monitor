# Responsive UI Contract: Mobile Dashboard Views

This contract defines the user-facing behavior that must hold across device sizes. It does not define new APIs or data formats.

## Scope

Affected surfaces:

- Dashboard shell and navigation.
- Daily reservations overview.
- Reservation management screen.
- Reservation create/edit/delete/day status/slot status modals.
- WhatsApp conversations viewer.
- Loading, empty, error, busy, and feedback states.

Out of scope:

- Backend behavior.
- Twilio behavior.
- Reservation business rules.
- Authentication or permissions.
- Color palette changes.
- New desktop workflows.

## Breakpoint Contract

- Phone-sized viewports must present a single primary column or an equivalent step-by-step flow.
- Tablet-sized viewports may use one or two columns only when content remains readable and touch-friendly.
- Desktop-sized viewports must preserve the current layout and workflow.
- No affected viewport may require horizontal scrolling to complete primary tasks.

## Navigation Contract

- Employees can move between dashboard, reservation management, and WhatsApp sections from every supported device size.
- Navigation labels remain recognizable and do not overlap or truncate in a way that blocks section choice.
- Active section indication remains visible.

## Reservations Overview Contract

- Reservation metrics remain readable and scannable.
- Hour blocks and reservation rows stack or reflow on narrow screens.
- Customer, time, party size, and status remain visible without browser zoom.
- Empty and error states remain visible and understandable.

## Reservation Management Contract

- Date selection, previous/next controls, create action, day status actions, and slot status actions remain reachable on phone and tablet.
- Reservation cards expose the same existing actions without changing what each action does.
- Action groups wrap or stack instead of shrinking below usable touch size.
- Long operational text wraps without hiding controls.

## Modal Contract

- Modals fit within the visible viewport on phone and tablet.
- Modal content can scroll when needed while keeping the current task understandable.
- Primary and secondary actions remain reachable.
- Existing busy, loading, validation, and error messages remain visible.

## WhatsApp Contract

- Conversation list remains searchable and scrollable on mobile.
- Conversation detail remains readable with chat bubbles sized to the viewport.
- Employees can move from list to detail and back without losing the selected workflow.
- Long messages wrap correctly and metadata remains secondary to message content.

## Verification Contract

Each affected surface must be checked at representative widths:

- 360px phone portrait.
- 430px large phone portrait.
- 667px phone landscape or small tablet.
- 768px tablet portrait.
- 1024px tablet landscape.
- 1280px desktop.

Passing result:

- No blocking horizontal overflow.
- No overlapping primary text or controls.
- Primary actions remain reachable.
- Existing desktop appearance remains materially unchanged.
