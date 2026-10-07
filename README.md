# PortfolioPro — Investment Portfolio Dashboard

A small, self-contained **Angular 22** single-page application that shows an investment
portfolio: valuation, per-holding gain/loss, asset allocation, a transaction history, a
profile, and full CRUD on both holdings and profile contacts. Styled with **Tailwind CSS**.
The frontend talks to a small **Express REST API** (using **Axios**) that stores data in
JSON files acting as a file-backed database. Built as a focused demonstration of modern
full-stack Angular patterns.

> Sample data only — no real money. Writes are persisted to the JSON files under
> `server/data`, so changes survive a page refresh. To reset to the seed data, run
> `git checkout server/data`.

## Highlights (what this demonstrates)

| Area | Where to look |
| --- | --- |
| **Standalone components** (no NgModules) | every `*.ts` in `src/app` |
| **Signals** for state + **`computed`** for derived values | [`portfolio.service.ts`](src/app/services/portfolio.service.ts), [`profile.service.ts`](src/app/services/profile.service.ts) |
| **REST API** (Express) over a JSON "database" | [`server/index.js`](server/index.js), [`server/data/`](server/data) |
| **Axios** HTTP client calling the API | [`core/api.ts`](src/app/core/api.ts) + both services |
| **Full CRUD** (create / read / update / delete) | holdings in [`holdings.ts`](src/app/features/holdings/holdings.ts); profile + contacts in [`profile.ts`](src/app/features/profile/profile.ts) |
| **Async data loading** with loading + error states | both services + feature templates |
| **Reactive forms** with validation | holdings & profile features |
| **Routing** with **lazy-loaded** views (`loadComponent`) | [`app.routes.ts`](src/app/app.routes.ts) |
| **Dependency injection** via `inject()` | all feature components |
| **Tailwind CSS** utility-first styling | templates + [`styles.css`](src/styles.css) |
| **Pure, unit-tested logic** split from the services | [`portfolio.logic.ts`](src/app/services/portfolio.logic.ts) |
| New built-in control flow (`@for`, `@if`, `@empty`) | all templates |
| Angular **pipes** (`currency`, `percent`, `date`, `number`) | all templates |
| **Unit tests** (Vitest via Angular's test builder) | `*.spec.ts` (12 tests) |

## Features

- **Dashboard** — total value, total gain/loss, asset-class allocation bar, and top holdings.
- **Holdings** — full positions table; **add**, **edit** and **sell** positions through a
  validated reactive form (average cost is recalculated when topping up).
- **Transactions** — buy/sell/dividend history with a type filter; new activity is logged
  automatically.
- **Profile** — view and **edit** personal details (name + address) and perform full CRUD
  on contact entries (phone/email/other). Editing the name updates the avatar/initials in
  the top bar instantly, demonstrating shared signal-based state.

## Architecture

```
server/
├─ index.js                            # Express REST API (CRUD endpoints)
└─ data/
   ├─ portfolio.json                   # holdings + transactions "database"
   └─ profile.json                     # profile + contacts "database"

src/app/
├─ app.ts / app.html                   # shell: loads data on boot, top bar, nav, outlet
├─ app.routes.ts                       # lazy-loaded routes
├─ core/api.ts                         # shared Axios instance (baseURL /api)
├─ models/                             # typed domain models
├─ services/
│  ├─ portfolio.service.ts             # fetches holdings/transactions via Axios → signals
│  ├─ portfolio.logic.ts               # pure derivation functions (unit-tested)
│  ├─ profile.service.ts               # fetches profile via Axios → signals
│  └─ profile.logic.ts                 # pure helper (unit-tested)
└─ features/
   ├─ dashboard/                       # summary + allocation + top holdings
   ├─ holdings/                        # table + add/edit reactive form
   ├─ transactions/                    # filtered activity history
   └─ profile/                         # profile details + contacts CRUD
```

**Data flow:** component → service method → **Axios** → **Express API** → JSON file.
The API returns the updated data, which the service stores in **signals**; `computed`
signals derive views/summaries, so the UI stays in sync without manual change detection.
In dev, the Angular dev-server proxies `/api/*` to the API on port 3000 (see
[`proxy.conf.json`](proxy.conf.json)), so there are no CORS issues.

### REST API endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/holdings` | list holdings |
| POST | `/api/holdings` | add / top up a holding |
| PUT | `/api/holdings/:id` | update a holding |
| POST | `/api/holdings/:id/sell` | sell (reduce/remove) a holding |
| GET | `/api/transactions` | list transactions |
| GET | `/api/profile` | get the profile |
| PUT | `/api/profile/details` | update name + address |
| POST | `/api/profile/contacts` | add a contact |
| PUT | `/api/profile/contacts/:id` | update a contact |
| DELETE | `/api/profile/contacts/:id` | delete a contact |

## Getting started

Requires Node 20+ and npm.

```bash
npm install
npm run dev        # runs the API (port 3000) AND the Angular app (port 4200) together
```

Then open http://localhost:4200.

Run the pieces individually if you prefer:

```bash
npm run api        # just the Express API on port 3000
npm start          # just the Angular dev server on port 4200
```

Other commands:

```bash
npm run build      # production build into dist/
npm test           # run unit tests once
git checkout server/data   # reset the "database" to the seed data
```

## Tech stack

Angular 22 · TypeScript (strict) · Angular Signals · Reactive Forms · Axios · Express ·
Tailwind CSS · Vitest
