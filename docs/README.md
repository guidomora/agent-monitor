# Docs Index

Use this folder as durable context for agents working on this repository.

## How to use these docs

- Read `architecture/` when you need to understand where code belongs or how data should move through the frontend.
- Read `domain/` when you need the product vocabulary and business concepts.
- Read `workflows/` when you need to understand how a current user or system flow works end to end.
- Read `specs/` when you need feature specifications created before implementation.
- Read `exec-plans/active/` when continuing implementation work already in progress.
- Read `exec-plans/completed/` when checking how previous plans were executed.

## Folder responsibilities

- `architecture/`: stable frontend structure, boundaries, and integration rules.
- `domain/`: business concepts used by the dashboard.
- `workflows/`: implemented operational flows, kept small and specific.
- `specs/`: feature specs generated before a feature starts or is about to start.
- `exec-plans/active/`: execution plans currently being implemented.
- `exec-plans/completed/`: execution plans already implemented.

Keep files short and focused. If a document starts covering multiple triggers, actors, or business rules, split it into smaller workflow or domain files.
