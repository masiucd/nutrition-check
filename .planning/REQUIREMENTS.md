# Requirements: CalorieTracker

**Defined:** 2026-04-02
**Core Value:** Fast, frictionless daily food logging with instant calorie totals.

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: User can sign up with email and password
- [ ] **AUTH-02**: User can log in with email and password
- [ ] **AUTH-03**: User session persists across browser refresh
- [ ] **AUTH-04**: User can log out from any page

### Food Database

- [ ] **FOOD-01**: User can search the local food database by name
- [ ] **FOOD-02**: User can add a new custom food item (name + calories per unit)
- [ ] **FOOD-03**: User can edit an existing food item (name or calories)
- [ ] **FOOD-04**: User can delete a food item from the database

### Daily Logging

- [ ] **LOG-01**: User can log a food item with quantity to today's entry
- [ ] **LOG-02**: User can edit a logged entry (change food or quantity)
- [ ] **LOG-03**: User can delete a logged entry from today's log
- [ ] **LOG-04**: User can view today's full food log with running calorie total
- [ ] **LOG-05**: User can categorize logged entries by meal (breakfast, lunch, dinner, snacks)

### Summaries

- [ ] **SUM-01**: User can view a weekly summary showing total calories per day for the past 7 days
- [ ] **SUM-02**: User can view a monthly summary showing total and average calories for the current month
- [ ] **SUM-03**: User can view a visual chart (bar or line) of calorie intake over time
- [ ] **SUM-04**: User can view the food log for any past day

## v2 Requirements

### Nutrition Tracking

- **NUTR-01**: User can track macros (protein, carbs, fat) per food item
- **NUTR-02**: User can view macro breakdown in daily totals and summaries

### Goals

- **GOAL-01**: User can set a daily calorie goal
- **GOAL-02**: User can see calories remaining vs goal on today's log

### Data Management

- **DATA-01**: User can export their log history as CSV
- **DATA-02**: User can import a food database from CSV

## Out of Scope

| Feature | Reason |
|---------|--------|
| Barcode scanning | Desktop web only; adds mobile camera complexity |
| External food APIs (USDA, Open Food Facts) | User prefers managing own local data |
| Multi-user / public access | Personal tool only |
| Mobile native app | Web-first; native adds platform complexity |
| Password reset via email | Single user; out of scope for v1 |
| OAuth (Google, GitHub) | Email/password sufficient for personal tool |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | — | Pending |
| AUTH-02 | — | Pending |
| AUTH-03 | — | Pending |
| AUTH-04 | — | Pending |
| FOOD-01 | — | Pending |
| FOOD-02 | — | Pending |
| FOOD-03 | — | Pending |
| FOOD-04 | — | Pending |
| LOG-01 | — | Pending |
| LOG-02 | — | Pending |
| LOG-03 | — | Pending |
| LOG-04 | — | Pending |
| LOG-05 | — | Pending |
| SUM-01 | — | Pending |
| SUM-02 | — | Pending |
| SUM-03 | — | Pending |
| SUM-04 | — | Pending |

**Coverage:**
- v1 requirements: 17 total
- Mapped to phases: 0 (roadmap pending)
- Unmapped: 17 ⚠️

---
*Requirements defined: 2026-04-02*
*Last updated: 2026-04-02 after initial definition*
