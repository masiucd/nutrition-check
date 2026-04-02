# CalorieTracker

## What This Is

A personal web-based calorie tracking application for solo use.
Users search a locally-managed food database, log meals against a daily entry,
and view weekly/monthly summaries of calorie intake.

## Core Value

Fast, frictionless daily food logging with instant calorie totals.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can create account and log in with email/password
- [ ] User can search a local food database by name
- [ ] User can log a food item with quantity to today's entry
- [ ] User can view today's food log and running calorie total
- [ ] User can view weekly and monthly calorie summaries

### Out of Scope

- Macro tracking (protein/carbs/fat) — not needed for v1, keep scope tight
- Barcode scanning — desktop web only, adds mobile complexity
- Multi-user / public access — personal tool, not a product
- External food APIs — user prefers managing own data locally

## Context

- **Stack:** React + TanStack Start, Postgres (no ORM, raw SQL), ShadCN, Tailwind CSS
- **Food database:** Local Postgres table, seeded and managed manually by the user
- **Auth:** Email/password session-based login (single user)
- **Platform:** Desktop web browser only
- **Deployment target:** Local development / self-hosted

## Constraints

- **Tech:** No ORM — raw SQL queries via postgres/pg driver only
- **Tech:** TanStack Start for full-stack React routing and server functions
- **Tech:** ShadCN + Tailwind for all UI components
- **Scope:** Desktop web only — no mobile-first concerns
- **Data:** No external food API integrations

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| No ORM | User preference for minimal, explicit Postgres setup | — Pending |
| Local food database | User manages own food data without external dependencies | — Pending |
| TanStack Start | User-specified full-stack React framework | — Pending |
| Email/password auth | Single user needs persistence; OAuth adds unnecessary complexity | — Pending |

---
*Last updated: 2026-04-02 after initialization*
