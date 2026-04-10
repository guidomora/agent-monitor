# AGENTS.md

## Project overview

This repository contains the frontend dashboard for monitoring a WhatsApp reservation agent.

Main goals of the app:
- Display WhatsApp conversations in a chat-like interface.
- Show reservation data, customer information, and dashboard metrics.
- Consume data from two sources:
  - Twilio APIs for WhatsApp message history.
  - Our backend APIs for reservations, metrics, and operational data.

The project uses Next.js and should remain easy to maintain, modular, and scalable.

---

## Working principles

When making changes in this repository, follow these rules:

1. Prefer simple and maintainable solutions over clever abstractions.
2. Do not replicate backend hexagonal architecture literally in the frontend.
3. Organize code by feature/module, not by technical type alone.
4. Keep UI components focused on presentation.
5. Keep data fetching, mapping, and orchestration outside presentational components.
6. Avoid unnecessary global state.
7. Reuse existing patterns before introducing new ones.
8. Make the smallest safe change that solves the problem.
9. Preserve current behavior unless the task explicitly requires changing it.
10. When in doubt, favor readability over abstraction.

---

## Expected frontend architecture

Use a feature-oriented architecture.

Recommended structure:

- `app`: routes, layouts, page entry points.
- `features`: feature modules such as `messages`, `reservations`, `dashboard`, `customers`.
- `shared`: reusable UI, shared utilities, shared types, generic helpers.
- `infrastructure`: API clients and external integrations.

### Architectural boundaries

#### `app`
Use for:
- Next.js routes
- layouts
- page composition
- server/client boundaries

Do not put business logic or heavy data transformation here.

#### `features`
Each feature should own its:
- components
- hooks
- services
- types
- mappers
- feature-specific utilities

Example:
- `features/messages`
- `features/reservations`
- `features/dashboard`

#### `shared`
Use for elements that are genuinely reusable across multiple features:
- UI primitives
- generic table components
- date/format helpers
- shared validation schemas
- common TypeScript types

Do not move code to `shared` too early. If it is only used by one feature, keep it in that feature.

#### `infrastructure`
Use for:
- HTTP client configuration
- API wrappers
- Twilio integration access
- backend API integration access

This layer should isolate external systems from the rest of the app.

---

## Data access rules

1. All external API calls must go through a dedicated service/client layer.
2. Do not call Twilio or backend endpoints directly from presentational components.
3. Normalize external DTOs before using them in UI.
4. Prefer explicit mapping functions when data from Twilio/backend does not match UI needs.
5. Centralize headers, auth handling, and base URL behavior in infrastructure code.

Example flow:
- infrastructure API call
- feature service
- feature hook
- UI component

---

## State management rules

Separate server state from UI state.

### Server state
Examples:
- reservations
- conversations
- messages
- dashboard metrics
- availability data

Use the project’s async data-fetching pattern consistently.
If TanStack Query is already installed, prefer TanStack Query for server state.

### UI state
Examples:
- selected chat
- filters panel open/closed
- local search input
- selected reservation row
- modal visibility

Prefer:
- `useState`
- `useReducer`

Only introduce a global store if there is a clear cross-page or deeply shared need.

Do not create a large global store for everything.

---

## Component design rules

1. Prefer small, focused components.
2. Presentational components should receive data via props.
3. Avoid mixing rendering, fetching, mapping, and heavy business logic in the same file.
4. If a page becomes large, extract feature-level container logic into hooks or feature components.
5. Keep components easy to test and reason about.

### Preferred split
- hooks orchestrate data and screen logic
- services fetch/transform data
- components render UI

---

## Naming conventions

Use clear and explicit names.

Preferred examples:
- `messages.service.ts`
- `useMessages.ts`
- `twilio-message.mapper.ts`
- `reservations-table.tsx`
- `reservation-details-sheet.tsx`

Avoid vague names like:
- `helper.ts`
- `data.ts`
- `utils.ts` inside feature folders unless the purpose is obvious

---

## TypeScript rules

1. Use TypeScript consistently.
2. Prefer explicit domain-oriented types for UI usage.
3. Do not leak raw external DTOs across the whole app.
4. Create mapper functions when adapting backend or Twilio responses.
5. Avoid `any`.
6. Prefer narrow, specific types over broad generic ones.
7. Organize types by purpose inside each feature instead of putting all of them in one file.

### Type organization convention

Inside each feature, prefer this structure when it adds clarity:

- `api/*.dto.ts`: raw backend or external API contracts
- `api/*.api-types.ts`: typed request/response shapes for frontend-facing route handlers or HTTP clients
- `model/*.types.ts`: feature domain types and reusable internal models
- `model/*.view-model.ts`: UI-facing models already adapted for rendering
- `model/*.enums.ts`: enums or semantic unions reused by multiple files

Rules:

- Keep DTOs close to the feature service that consumes them.
- Keep HTTP response/request contracts out of presentational components when they represent a real API boundary.
- Keep mappers in the same feature as the DTOs and models they transform.
- Do not create a global `types` folder for feature-specific contracts.
- If a component prop type is only used in one component, it can stay in that component.
- Only move types to `shared` when they are genuinely reused by multiple features.

---

## Styling and UI rules

1. Follow existing project styling conventions.
2. Reuse existing UI primitives before creating new ones.
3. Keep visual patterns consistent across pages.
4. Prioritize dashboard usability and clarity over flashy design.
5. Optimize for operational visibility: dense but readable UI is acceptable.

For operational screens:
- important data should be easy to scan
- statuses should be visually distinguishable
- filters/search should be easy to access
- avoid clutter

---

## File placement rules

Use these rules when creating files:

- If code is specific to one feature, place it inside that feature.
- If code is reused by multiple features, place it in `shared`.
- If code integrates with external systems, place it in `infrastructure`.
- If code defines route/layout/page composition, place it in `app`.

Do not create new top-level folders unless truly necessary.

---

## Refactoring rules

When refactoring:
1. Preserve behavior unless explicitly asked otherwise.
2. Prefer incremental refactors over big rewrites.
3. Do not move many files unless it clearly improves maintainability.
4. Avoid introducing architecture that is more complex than the current needs.
5. If you notice repeated patterns, propose a reusable abstraction only after confirming the repetition is real.

---

## Code change policy

Before making changes:
1. Inspect existing patterns in nearby files.
2. Match the local style of the repository.
3. Prefer consistency with the current codebase over personal preference.

When implementing:
1. Touch the minimum number of files needed.
2. Keep diffs focused.
3. Avoid unrelated cleanups.
4. Do not rename files or symbols unless necessary.

After implementing:
1. Verify imports and types.
2. Verify no dead code was introduced.
3. Verify the UI flow still makes sense.
4. Verify loading/error/empty states if data fetching is involved.

---

## Handling API integrations

### Twilio
- Treat Twilio responses as external DTOs.
- Map Twilio message data into UI-friendly models before rendering.
- Keep Twilio-specific logic isolated from generic chat UI where possible.

### Backend
- Prefer typed API wrappers.
- Keep endpoint access centralized.
- Avoid scattering endpoint paths across the codebase.

---

## Error handling

1. Do not swallow errors silently.
2. Show user-friendly UI states when appropriate.
3. Keep technical details in logs/debug paths, not in user-facing messages.
4. Handle loading, empty, and error states explicitly for async screens.

---

## Performance guidance

1. Avoid premature optimization.
2. Do not introduce memoization everywhere by default.
3. Optimize only when there is a clear rendering or data-size problem.
4. For chat/message lists, be mindful of large collections and rendering costs.
5. Keep transformations out of render bodies when they are non-trivial.

---


## Definition of done

A task is done when:
- the requested behavior is implemented,
- the code follows the repository architecture,
- the solution is understandable and maintainable,
- types are correct,
- affected flows were checked,
- and no unnecessary complexity was introduced.

---

## What to avoid

Do not:
- introduce excessive layers for simple UI work
- fetch data directly inside deeply presentational components
- create massive global stores
- move feature-specific code into `shared` without real reuse
- use raw external API shapes everywhere in the UI
- make broad refactors unrelated to the task

---

## If the task is ambiguous

If a request is ambiguous, prefer the solution that:
1. matches the current repository patterns,
2. minimizes scope,
3. keeps the feature modular,
4. and preserves future extensibility.

When useful, explain tradeoffs briefly in comments or in the final summary.

---

## Output expectations for Codex

When completing a task in this repo:
1. First understand the relevant feature/module.
2. Follow the local architecture.
3. Implement the smallest correct solution.
4. Summarize what changed in a concise way.
5. Mention any assumptions or follow-up recommendations only if they are relevant.
