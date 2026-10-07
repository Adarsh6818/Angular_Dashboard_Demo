# PortfolioPro — Investment Portfolio Dashboard

A small, self-contained **Angular 22** single-page application that shows an investment
portfolio: valuation, per-holding gain/loss, asset allocation, a transaction history, a
profile, and full CRUD on both holdings and profile contacts. Styled with **Tailwind CSS**.
Built as a focused demonstration of modern Angular patterns.

> Sample/mock data only — no backend and no real money. State lives in memory, so a full
> page refresh resets it to the seed data.

## Highlights (what this demonstrates)

| Area | Where to look |
| --- | --- |
| **Standalone components** (no NgModules) | every `*.ts` in `src/app` |
| **Signals** for state + **`computed`** for derived values | [`portfolio.service.ts`](src/app/services/portfolio.service.ts), [`profile.service.ts`](src/app/services/profile.service.ts) |
| **Full CRUD** (create / read / update / delete) | holdings in [`holdings.ts`](src/app/features/holdings/holdings.ts); profile + contacts in [`profile.ts`](src/app/features/profile/profile.ts) |
| **Reactive forms** with validation | holdings & profile features |
| **Routing** with **lazy-loaded** views (`loadComponent`) | [`app.routes.ts`](src/app/app.routes.ts) |
| **Dependency injection** via `inject()` | all feature components |
| **Tailwind CSS** utility-first styling | templates + [`styles.css`](src/styles.css) |
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
src/app/
├─ app.ts / app.html                  # shell: top bar (value + profile chip), nav, outlet
├─ app.routes.ts                       # lazy-loaded routes
├─ models/                             # typed domain models
├─ services/
│  ├─ portfolio.service.ts             # holdings/transactions state (signals + computed)
│  └─ profile.service.ts               # profile + contacts state (signals + computed)
└─ features/
   ├─ dashboard/                       # summary + allocation + top holdings
   ├─ holdings/                        # table + add/edit reactive form
   ├─ transactions/                    # filtered activity history
   └─ profile/                         # profile details + contacts CRUD
```

State lives in the services as signals; components stay thin and read `computed` signals,
so the UI is always in sync without manual change detection or subscriptions. Swapping the
seed data for a real `HttpClient` call would not change the public API.

## Getting started

Requires Node 20+ and npm.

```bash
npm install
npm start          # dev server at http://localhost:4200
```

Other commands:

```bash
npm run build      # production build into dist/
npm test           # run unit tests once
```

## Tech stack

Angular 22 · TypeScript (strict) · Angular Signals · Reactive Forms · Tailwind CSS · Vitest
