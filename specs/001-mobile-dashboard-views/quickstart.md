# Quickstart: Mobile Dashboard Views

## Goal

Implement responsive visual improvements only. Do not change business logic, API calls, data mapping, mutation behavior, permissions, routes, or the existing color palette.

## Implementation Order

1. Inspect the current desktop screens before editing:
   - `/`
   - `/gestion`
   - `/whatsapp`

2. Update responsive layout behavior in the smallest useful scope:
   - Prefer `app/globals.css` breakpoint refinements for existing class-based layout.
   - Adjust feature component markup only when CSS alone cannot produce a usable mobile flow.
   - Keep any new UI-only state local to the affected component.

3. Preserve desktop:
   - Treat current desktop layout as the baseline.
   - Add narrower viewport rules instead of rewriting desktop structure.
   - Avoid palette, route, service, mapper, DTO, or API changes.

4. Validate phone and tablet workflows:
   - Dashboard overview.
   - Reservation management list, toolbar, actions, modals, and feedback states.
   - WhatsApp list, search, selected conversation, message list, loading/error/empty states.

## Verification Commands

```powershell
npm run lint
npm run build
```

## Manual Responsive Checks

Check these representative viewport widths:

- 360px
- 430px
- 667px
- 768px
- 1024px
- 1280px

For each affected page, verify:

- No blocking horizontal overflow.
- No overlapping labels, buttons, cards, modals, or chat bubbles.
- Text wraps cleanly.
- Touch targets are reachable.
- Loading, error, empty, selected, and busy states remain understandable.
- Desktop still looks and behaves like the original dashboard.

## Validation Results

- `npm run lint`: passed.
- `npm run build`: passed.
- Chrome headless responsive captures generated for `/`, `/gestion`, and `/whatsapp` at 360px, 430px, 667px, 768px, 1024px, and 1280px.
- Manual screenshot review covered `/gestion` at 360px, 430px, and 768px; `/whatsapp` at 360px and 430px; and `/` at 360px and 1280px.
- Verified mobile-only WhatsApp layout presents the chat list as the first view and hides the conversation pane until a chat is selected.
- Verified mobile/tablet reservation controls wrap without clipped labels, and open custom selects stack above adjacent closed selects.
