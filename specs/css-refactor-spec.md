# CSS Refactor Specification

**Goal:** Split `app/globals.css` into smaller, responsibility-focused CSS files without changing visual behavior, JSX class names, routes, data flow, or component logic.

**Scope:** CSS organization only. This refactor should preserve the current dashboard appearance across `/`, `/gestion`, and `/whatsapp`, including desktop, tablet, and phone layouts.

**Non-goals:**
- Do not redesign the UI.
- Do not migrate the full app to CSS Modules in this refactor.
- Do not rename classes.
- Do not move React components.
- Do not change Tailwind usage, API calls, mappers, services, hooks, or state logic.
- Do not introduce a design system package or new styling dependency.

---

## Current Problem

`app/globals.css` is acting as a catch-all stylesheet. It contains:

- Tailwind import and theme token definitions.
- Browser and document-level base styles.
- App shell and dashboard layout.
- Shared card, button, form, scrollbar, status, and feedback patterns.
- Reservation-specific page and modal styles.
- WhatsApp-specific layout and scrolling styles.
- Reservation loader animation styles and keyframes.
- Responsive overrides for multiple feature areas.

The classes are already mostly grouped by naming prefix (`dashboard-*`, `reservation-*`, `schedule-*`, `whatsapp-*`, etc.), so the main issue is file organization rather than selector design. The safest first step is to split by responsibility while keeping the current global class contract intact.

---

## Proposed File Structure

Create a CSS folder under `app`:

```text
app/
|-- globals.css
`-- styles/
    |-- theme.css
    |-- base.css
    |-- dashboard-shell.css
    |-- shared-ui.css
    |-- reservations.css
    |-- reservation-modals.css
    |-- reservation-loader.css
    |-- whatsapp.css
    `-- responsive.css
```

`app/globals.css` remains the only stylesheet imported by `app/layout.tsx`. It becomes an entry point that imports Tailwind and the local CSS files in a deliberate order.

Recommended final shape:

```css
@import "tailwindcss";

@import "./styles/theme.css";
@import "./styles/base.css";
@import "./styles/dashboard-shell.css";
@import "./styles/shared-ui.css";
@import "./styles/reservations.css";
@import "./styles/reservation-modals.css";
@import "./styles/reservation-loader.css";
@import "./styles/whatsapp.css";
@import "./styles/responsive.css";
```

The import order matters. Base definitions must come before feature styles, and responsive overrides must come last so they keep the current cascade behavior.

---

## What Stays Global

These styles should remain globally available because they define app-wide foundations or intentionally shared UI primitives.

### `app/globals.css`

Responsibility:
- Single CSS entry point.
- Tailwind import.
- Ordered imports for all local CSS files.

Keep only:

```css
@import "tailwindcss";
@import "./styles/theme.css";
@import "./styles/base.css";
@import "./styles/dashboard-shell.css";
@import "./styles/shared-ui.css";
@import "./styles/reservations.css";
@import "./styles/reservation-modals.css";
@import "./styles/reservation-loader.css";
@import "./styles/whatsapp.css";
@import "./styles/responsive.css";
```

### `app/styles/theme.css`

Responsibility:
- CSS variables.
- Tailwind theme token bridge.
- App color/font tokens.

Move here:
- `:root`
- `@theme inline`

Examples of selectors/rules:
- `--background`
- `--panel`
- `--accent`
- `--danger`
- `--font-sans`
- `--font-mono`

### `app/styles/base.css`

Responsibility:
- Browser-level defaults.
- Document layout defaults.
- Generic element resets.
- App-wide utility selectors that are not feature-specific.

Move here:
- `*`
- `html`
- `body`
- `a`
- `button, input, select, textarea`
- `::selection`
- `.panel-shadow`
- `.scrollbar-thin`
- `.scrollbar-thin::-webkit-scrollbar`
- `.scrollbar-thin::-webkit-scrollbar-thumb`

Reasoning:
- These rules affect the whole app or are generic utility classes reused across features.

### `app/styles/dashboard-shell.css`

Responsibility:
- Root app frame.
- Dashboard shell layout.
- Sidebar navigation.
- Shared route-level layout wrappers.

Move here:
- `.app-shell`
- `.app-shell--embedded`
- `.dashboard-frame`
- `.dashboard-grid`
- `.dashboard-sidebar`
- `.dashboard-sidebar__brand`
- `.dashboard-main`
- `.dashboard-eyebrow`
- `.dashboard-nav`
- `.dashboard-nav__link`
- `.dashboard-nav__meta`
- `.surface-stack`

Reasoning:
- These classes define route composition and shell structure, not one feature's internals.

### `app/styles/shared-ui.css`

Responsibility:
- Reusable visual primitives used by more than one feature or more than one reservations screen.
- Generic dashboard cards, buttons, chips, lists, rows, feedback, and forms.

Move here:
- `.hero-card`
- `.hero-copy`
- `.hero-summary`
- `.hero-summary__trigger`
- `.hero-summary__range`
- `.hero-summary__separator`
- `.hero-actions`
- `.pill-tag`
- `.panel-card`
- `.panel-card__header`
- `.section-intro`
- `.stats-grid`
- `.content-grid`
- `.crud-grid`
- `.management-grid`
- `.stat-card`
- `.note-card`
- `.timeline-list`
- `.note-list`
- `.table-list`
- `.crud-list`
- `.crud-form`
- `.crud-form__row`
- `.crud-form__footer`
- `.crud-form__actions`
- `.crud-form__field-note`
- `.crud-list__item`
- `.reservation-row`
- `.table-row`
- `.status-chip`
- `.occupancy-pill`
- `.action-button`
- `.management-feedback`

Reasoning:
- These are currently shared patterns. Even if some are reservation-heavy today, keeping them together avoids premature component-level splitting.
- `reservation-row` can stay here for the first refactor because it is part of the shared timeline/table visual language. If later it becomes clearly reservation-only, move it to `reservations.css`.

---

## What Moves To Feature CSS

### `app/styles/reservations.css`

Responsibility:
- Reservation overview and management screen layout.
- Schedule controls.
- Operational day/slot status blocks.
- Reservation cards.
- Available date chips.
- Closure failure toast.

Move here:
- `.schedule-toolbar`
- `.schedule-date-field`
- `.schedule-toolbar__nav-button`
- `.schedule-toolbar__nav-button--next`
- `.schedule-day-status`
- `.schedule-day-status__summary`
- `.schedule-day-status__actions`
- `.schedule-day-status__label`
- `.schedule-day-status__meta`
- `.schedule-slot-status`
- `.schedule-slot-status__summary`
- `.schedule-slot-status__actions`
- `.day-status-badge`
- `.available-dates-list`
- `.available-dates-list--modal`
- `.available-date-chip`
- `.management-overview`
- `.management-overview__metric`
- `.reservation-card`
- `.reservation-card--selected`
- `.reservation-card__body`
- `.reservation-card__time`
- `.reservation-card__actions`
- `.reservation-card__meta`
- `.reservation-card__notes`
- `.reservation-inspector`
- `.reservation-inspector__hero`
- `.timeline-item--management`
- `.timeline-item--closed`
- `.timeline-item__reason`
- `.closure-failure-toast-stack`
- `.closure-failure-toast`
- `.closure-failure-toast__content`
- `.closure-failure-toast__close`

Reasoning:
- These selectors are tied to reservations and operational agenda flows.

### `app/styles/reservation-modals.css`

Responsibility:
- Modal overlay.
- Dates modal.
- Reservation create/edit/delete modal structure.
- Day/slot status modal summaries.
- Custom reservation edit select.

Move here:
- `.modal-overlay`
- `.modal-overlay--busy`
- `.dates-modal`
- `.dates-modal__header`
- `.dates-modal__close`
- `.reservation-edit-modal`
- `.reservation-edit-modal--busy`
- `.reservation-edit-modal__summary`
- `.reservation-edit-modal__footer`
- `.reservation-edit-modal__loading`
- `.reservation-edit-modal__submit`
- `.reservation-delete-modal`
- `.reservation-delete-modal__summary`
- `.reservation-delete-modal__details`
- `.reservation-delete-modal__footer`
- `.reservation-delete-modal__submit`
- `.reservation-day-status-modal__summary`
- `.reservation-day-status-modal__stats`
- `.reservation-edit-select`
- `.reservation-edit-select__trigger`
- `.reservation-edit-select__value`
- `.reservation-edit-select__time`
- `.reservation-edit-select__description`
- `.reservation-edit-select__option-description`
- `.reservation-edit-select__placeholder`
- `.reservation-edit-select__empty`
- `.reservation-edit-select__icon`
- `.reservation-edit-select__menu`
- `.reservation-edit-select__option`

Reasoning:
- These styles are specific to reservation modal workflows and the custom select used inside those workflows.
- They are global classes for now because multiple modal components use the same modal primitives.

### `app/styles/reservation-loader.css`

Responsibility:
- Reservation edit/create busy-state loader visuals.
- Loader keyframes.

Move here:
- `.reservation-loader`
- `.reservation-loader__glare-top`
- `.reservation-loader__glare-bottom`
- `.reservation-loader__model`
- `.reservation-loader__motion-thick`
- `.reservation-loader__motion-medium`
- `.reservation-loader__motion-thin`
- `.reservation-loader__sand-drop`
- `.reservation-loader__sand-fill`
- `.reservation-loader__sand-grain-left`
- `.reservation-loader__sand-grain-right`
- `.reservation-loader__sand-line-left`
- `.reservation-loader__sand-line-right`
- `.reservation-loader__sand-mound-top`
- `.reservation-loader__sand-mound-bottom`
- `@keyframes reservation-loader-flip`
- `@keyframes reservation-loader-glare-top`
- `@keyframes reservation-loader-glare-bottom`
- `@keyframes reservation-loader-motion-thick`
- `@keyframes reservation-loader-motion-medium`
- `@keyframes reservation-loader-motion-thin`
- `@keyframes reservation-loader-sand-drop`
- `@keyframes reservation-loader-sand-fill`
- `@keyframes reservation-loader-sand-grain-left`
- `@keyframes reservation-loader-sand-grain-right`
- `@keyframes reservation-loader-sand-line-left`
- `@keyframes reservation-loader-sand-line-right`
- `@keyframes reservation-loader-sand-mound-top`
- `@keyframes reservation-loader-sand-mound-bottom`

Reasoning:
- The loader is self-contained and currently contributes a large amount of CSS noise.
- Extracting it is low-risk if class names and keyframe names are unchanged.

### `app/styles/whatsapp.css`

Responsibility:
- WhatsApp page layout.
- Conversation list/detail shell.
- WhatsApp scroll containers.
- Mobile list/detail visibility classes that are not generic.

Move here:
- `.whatsapp-shell`
- `.whatsapp-sidebar`
- `.whatsapp-conversation`
- `.whatsapp-list-scroll`
- `.whatsapp-message-scroll`
- `.whatsapp-back-button`
- Any existing `whatsapp-*` selectors in `globals.css`.

Reasoning:
- These selectors belong only to `features/whatsapp/components/whatsapp-viewer.tsx`.
- They should be isolated from reservation dashboard styles.

---

## Responsive Strategy

### `app/styles/responsive.css`

Responsibility:
- All media queries from the current `globals.css`, preserved in the same relative order.
- Cross-feature responsive overrides.

Move here:
- `@media (max-width: 1199px)`
- `@media (max-width: 920px)`
- `@media (max-width: 640px)`
- `@media (max-width: 380px)`
- Any other current breakpoint blocks.

Important rule:
- During the first refactor, do not split media query overrides into each feature file unless doing so is mechanical and clearly safe.

Reasoning:
- The current responsive behavior depends on cascade order.
- Keeping all breakpoints last preserves behavior and avoids subtle regressions.
- Once the first split is stable, a later refactor can move feature-specific responsive blocks closer to their feature CSS.

Future optional split:

```text
app/styles/responsive.css
app/styles/responsive-dashboard.css
app/styles/responsive-reservations.css
app/styles/responsive-whatsapp.css
```

Do not do this in the first pass unless the initial split is already verified.

---

## CSS Modules Decision

Do not migrate broadly to CSS Modules in this refactor.

Good future candidates for CSS Modules:
- `features/reservations/components/reservation-edit-select.tsx`
- `features/reservations/components/reservation-edit-loader.tsx`
- `features/reservations/components/closure-notification-failure-toast.tsx`

Why not now:
- The current CSS is global and many classes are shared across multiple components.
- A CSS Modules migration would require JSX changes.
- The immediate value is readability and maintainability, which can be achieved by file splitting first.

Rule:
- This refactor is successful if `globals.css` becomes a small import manifest and visual behavior remains unchanged.

---

## Implementation Plan

### Phase 1: Preparation

1. Confirm current `app/globals.css` line count and selector groups.
2. Confirm `app/layout.tsx` imports only `./globals.css`.
3. Confirm there are no existing `.module.css` files or component-level CSS imports that would affect the split strategy.
4. Create `app/styles/`.

### Phase 2: Extract Foundations

1. Move `:root` and `@theme inline` into `app/styles/theme.css`.
2. Move reset, document, body, form inheritance, selection, scrollbar, and generic utility styles into `app/styles/base.css`.
3. Update `app/globals.css` to import `theme.css` and `base.css` after Tailwind.
4. Run `npm run lint`.

### Phase 3: Extract Shell and Shared UI

1. Move dashboard shell selectors into `app/styles/dashboard-shell.css`.
2. Move shared visual primitives into `app/styles/shared-ui.css`.
3. Preserve selector order from the original CSS as much as possible.
4. Update `app/globals.css` imports.
5. Run `npm run lint`.

### Phase 4: Extract Feature Styles

1. Move reservation page and management selectors into `app/styles/reservations.css`.
2. Move reservation modal and custom select selectors into `app/styles/reservation-modals.css`.
3. Move reservation loader selectors and keyframes into `app/styles/reservation-loader.css`.
4. Move WhatsApp selectors into `app/styles/whatsapp.css`.
5. Update `app/globals.css` imports.
6. Run `npm run lint`.

### Phase 5: Extract Responsive Overrides

1. Move all media query blocks into `app/styles/responsive.css`.
2. Keep breakpoint blocks in the same order they currently appear.
3. Keep `responsive.css` as the final local import.
4. Run `npm run lint`.
5. Run `npm run build`.

### Phase 6: Visual Verification

Check the same representative views covered by the mobile dashboard work:

- `/` at `360px`, `430px`, `768px`, and desktop width.
- `/gestion` at `360px`, `430px`, `768px`, `1024px`, and desktop width.
- `/whatsapp` at `360px`, `430px`, `768px`, and desktop width.

Verify:
- No horizontal page overflow.
- No clipped text in cards, buttons, chips, forms, or modal headers.
- Modals still scroll correctly on small screens.
- WhatsApp list/detail mobile behavior still works.
- Desktop shell still keeps sidebar/main layout.
- Colors, borders, shadows, spacing, and typography match the pre-refactor UI.

---

## Guardrails

1. Keep class names unchanged.
2. Keep selector specificity unchanged unless a bug is found and intentionally fixed.
3. Keep media queries last.
4. Avoid reordering unrelated declarations.
5. Do not combine this with Tailwind class cleanup.
6. Do not introduce CSS nesting.
7. Do not introduce CSS Modules in this pass.
8. Do not delete selectors unless `rg` confirms they are unused and the deletion is explicitly accepted as part of the task.
9. Do not modify component files unless an import path genuinely requires it. The intended approach should not require JSX edits.
10. Keep the diff mechanical enough that review can compare moved blocks, not new styling decisions.

---

## Suggested Review Checklist

- [ ] `app/globals.css` only imports Tailwind and local CSS files.
- [ ] `app/styles/theme.css` contains tokens and Tailwind theme bridge only.
- [ ] `app/styles/base.css` contains document/base/global utility styles only.
- [ ] `app/styles/dashboard-shell.css` contains app shell and navigation layout only.
- [ ] `app/styles/shared-ui.css` contains reusable dashboard UI primitives only.
- [ ] `app/styles/reservations.css` contains reservation screen styles only.
- [ ] `app/styles/reservation-modals.css` contains reservation modal/select styles only.
- [ ] `app/styles/reservation-loader.css` contains loader selectors and keyframes only.
- [ ] `app/styles/whatsapp.css` contains WhatsApp-specific styles only.
- [ ] `app/styles/responsive.css` is imported last and contains all media queries.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] Manual responsive checks pass for `/`, `/gestion`, and `/whatsapp`.

---

## Later Improvements

After the first split is verified, consider these as separate tasks:

1. Move feature-specific responsive blocks from `responsive.css` into feature CSS files if doing so improves readability without changing cascade behavior.
2. Convert isolated components to CSS Modules one at a time.
3. Replace duplicated button/form/card styles with shared React UI primitives only if repeated usage is stable.
4. Document CSS conventions in `docs/architecture/repo-structure.md` or a dedicated styling guide.

