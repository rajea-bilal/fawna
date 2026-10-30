# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

This is a **single-context** repo (one project, no monorepo split). It doesn't use the `CONTEXT.md` / `docs/adr/` layout the skills default to — instead:

## Before exploring, read these

- **`docs/decisions.md`** — this repo's ADR log. Decisions are numbered `ADR-001`, `ADR-002`, ... inline in one file (not one file per decision under `docs/adr/`). Each entry has Date, Status (`Proposed` / `Accepted` / `Implemented` / `Validated`), Context, Options, Decision, Risks, Validation, Lesson. Read the entries that touch the area you're about to work in.
- **`docs/learning.md`** — the closest thing to a domain glossary / learning log for this repo. Treat it as the `CONTEXT.md` equivalent for vocabulary and concepts.
- **`docs/progress.md`** and **`docs/process.md`** — supporting context on what's been built and how, useful but secondary to the two above.

There is no `CONTEXT.md` or `docs/adr/` directory in this repo, and none is scaffolded by this setup. If `/domain-modeling` (via `/grill-with-docs` or `/improve-codebase-architecture`) later wants to create one, that's fine — until then, treat the files above as authoritative.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `docs/learning.md`. Don't drift to synonyms the doc explicitly avoids.

If the concept you need isn't documented yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap worth noting.

## Flag ADR conflicts

If your output contradicts an existing decision in `docs/decisions.md`, surface it explicitly rather than silently overriding:

> _Contradicts ADR-002 (base64 image upload) — but worth reopening because…_
