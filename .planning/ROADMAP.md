# Roadmap: CalorieTracker

**Project:** CalorieTracker
**Core Value:** Fast, frictionless daily food logging with instant calorie totals.
**Total Phases:** 5
**v1 Requirements:** 17 — all mapped ✓

---

## Phase 1: Project Foundation

**Goal:** Set up the TanStack Start + Postgres project structure with working database connection and authentication.

**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04

**Success Criteria:**
1. User can visit the app and see a login/signup page
2. User can create an account with email and password
3. User can log in and be redirected to the main app
4. User session persists after browser refresh — no re-login required
5. User can log out and be redirected to login page

---

## Phase 2: Food Database

**Goal:** Build the local food database with full CRUD so the user can populate and manage their food library.

**Requirements:** FOOD-01, FOOD-02, FOOD-03, FOOD-04

**Success Criteria:**
1. User can search foods by name and see matching results with calorie info
2. User can add a new food item with a name and calories-per-unit
3. User can edit an existing food item's name or calorie value
4. User can delete a food item from the database
5. Search returns results instantly as the user types

---

## Phase 3: Daily Food Logging

**Goal:** Build the core daily logging experience — log meals, edit entries, see today's total.

**Requirements:** LOG-01, LOG-02, LOG-03, LOG-04, LOG-05

**Success Criteria:**
1. User can search for a food and log it with a quantity to today's entry
2. User can assign a logged entry to a meal category (breakfast, lunch, dinner, snacks)
3. User can edit a logged entry to change the food or quantity
4. User can delete a logged entry
5. User sees today's complete food log with a running calorie total that updates on every change

---

## Phase 4: History & Summaries

**Goal:** Build weekly/monthly summaries and past-day browsing so the user can understand their intake over time.

**Requirements:** SUM-01, SUM-02, SUM-03, SUM-04

**Success Criteria:**
1. User can view a weekly summary showing total calories for each of the past 7 days
2. User can view a monthly summary with total and daily average calories
3. User can see a visual chart (bar or line) of calorie intake over a time range
4. User can navigate to any past day and view the full food log for that day

---

## Phase 5: Polish & Production Readiness

**Goal:** Refine UI, fix rough edges, ensure the app is reliable and pleasant to use daily.

**Requirements:** (cross-cutting quality — no new v1 requirements; validates all prior phases work together end-to-end)

**Success Criteria:**
1. All pages are responsive and visually consistent using ShadCN + Tailwind
2. Error states are handled gracefully (invalid login, food not found, empty log)
3. Loading states are shown for all async operations
4. The app works reliably in a local dev environment without crashes

---

## Requirement Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| FOOD-01 | Phase 2 | Pending |
| FOOD-02 | Phase 2 | Pending |
| FOOD-03 | Phase 2 | Pending |
| FOOD-04 | Phase 2 | Pending |
| LOG-01 | Phase 3 | Pending |
| LOG-02 | Phase 3 | Pending |
| LOG-03 | Phase 3 | Pending |
| LOG-04 | Phase 3 | Pending |
| LOG-05 | Phase 3 | Pending |
| SUM-01 | Phase 4 | Pending |
| SUM-02 | Phase 4 | Pending |
| SUM-03 | Phase 4 | Pending |
| SUM-04 | Phase 4 | Pending |

**Coverage:** 17/17 v1 requirements mapped ✓

---
*Roadmap created: 2026-04-02*
