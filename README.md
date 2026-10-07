# PortfolioPro — Investment Portfolio Dashboard

A small, self-contained **Angular 22** single-page application that shows an investment
portfolio: live valuation, per-holding gain/loss, asset allocation, a transaction
history, and the ability to add or sell positions. Built as a focused demonstration of
modern Angular patterns.

> Sample/mock data only — no backend, no real market data, no real money.

## Highlights (what this demonstrates)

| Area | Where to look |
| --- | --- |
| **Standalone components** (no NgModules) | every `*.ts` in `src/app` |
| **Signals** for state + **`computed`** for derived values | [`portfolio.service.ts`](src/app/services/portfolio.service.ts) |
| **Reactive forms** with validation | [`holdings.ts`](src/app/features/holdings/holdings.ts) / `.html` |
| **Routing** with **lazy-loaded** views (`loadComponent`) | [`app.routes.ts`](src/app/app.routes.ts) |
| **Dependency injection** via `inject()` | all feature components |
| **RxJS** driving a simulated live price feed | `toggleLivePrices()` in the service |
| New built-in control flow (`@for`, `@if`, `@empty`) | all templates |
| Angular **pipes** (`currency`, `percent`, `date`, `number`) | all templates |
| **Unit tests** (Vitest via Angular's test builder) | `*.spec.ts` |
| Responsive, themeable **SCSS** design system | [`styles.scss`](src/styles.scss) |

## Features

- **Dashboard** — total value, total gain/loss, asset-class allocation bar, and top holdings.
- **Holdings** — full positions table with live price, market value and unrealised
  gain/loss; add a new position through a validated reactive form, or sell an existing one
  (average cost is recalculated when topping up).
- **Transactions** — buy/sell/dividend history with a type filter; new activity is logged
  automatically.
- **Live feed toggle** — simulates a streaming market-data feed (RxJS `interval`) that
  nudges prices every 1.5s; the whole UI updates reactively through signals.

## Architecture

```
src/app/
├─ app.ts / app.html / app.scss     # shell: top bar, nav, router outlet
├─ app.routes.ts                     # lazy-loaded routes
├─ models/portfolio.models.ts        # typed domain models
├─ services/portfolio.service.ts     # single source of truth (signals + computed + RxJS)
└─ features/
   ├─ dashboard/                      # summary + allocation + top holdings
   ├─ holdings/                       # table + reactive "add holding" form
   └─ transactions/                   # filtered activity history
```

State lives in the service as signals; components stay thin and read `computed` signals,
so the UI is always in sync without manual change detection or subscriptions. Swapping the
seed data / `tickPrices()` for a real `HttpClient` call would not change the public API.

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

Angular 22 · TypeScript (strict) · RxJS · Angular Signals · Reactive Forms · SCSS · Vitest
