# Research: Mobile Dashboard Views

## Decision: Use responsive-first layouts

**Rationale**: The feature goal is to support all device sizes without changing desktop behavior. The current UI already has global CSS, feature components, and breakpoint patterns, so extending the responsive behavior is the smallest maintainable path.

**Alternatives considered**:

- Fully separate mobile pages: rejected because it duplicates behavior and increases the chance of desktop/mobile drift.
- Rebuild the dashboard shell: rejected because the existing shell already owns navigation, palette, and page composition.
- Responsive-only with no exceptions: rejected as an absolute rule because WhatsApp and reservation management may need different mobile interaction surfaces if the current two-pane layouts become cramped.

## Decision: Preserve desktop through additive breakpoint changes

**Rationale**: The spec requires the desktop experience to remain unchanged. Desktop CSS should remain the baseline where possible, with smaller viewport rules layered below current desktop breakpoints.

**Alternatives considered**:

- Redesign desktop and mobile together: rejected because it expands scope and risks regressions.
- Replace global layout primitives: rejected because many screens depend on the current class names and spacing model.

## Decision: Keep the existing color palette

**Rationale**: The user explicitly requested the same palette. Existing CSS custom properties define the product colors and status tones, so responsive work should adjust layout, density, and hierarchy without changing color identity.

**Alternatives considered**:

- Introduce a mobile-specific palette: rejected because it weakens visual continuity.
- Simplify status colors: rejected unless a specific contrast problem is found during implementation.

## Decision: Treat this as a visual UI contract, not a data contract change

**Rationale**: The feature must not change app functionality or logic. Existing reservations and WhatsApp clients, route handlers, mappers, and mutation flows remain the source of behavior.

**Alternatives considered**:

- Add new mobile-specific API responses: rejected because the same data should drive all device layouts.
- Add new state management for device size: rejected unless a component truly needs UI-only state for navigation or panels.

## Decision: Validate by representative viewports

**Rationale**: The risk is visual usability across sizes, not business logic correctness. Verification should cover phone portrait, phone landscape, tablet portrait, tablet landscape, and desktop.

**Alternatives considered**:

- Unit tests only: rejected because they do not catch overflow, text clipping, touch target density, or modal viewport issues.
- Manual desktop-only smoke test: rejected because it misses the primary feature value.
