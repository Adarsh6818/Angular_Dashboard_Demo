import { computed, Injectable, signal } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import {
  AllocationSlice,
  AssetClass,
  Holding,
  HoldingView,
  NewHoldingInput,
  PortfolioSummary,
  Transaction,
} from '../models/portfolio.models';

/**
 * Single source of truth for portfolio state.
 *
 * State is held in Angular signals and all derived values (summary, allocation,
 * per-holding gain/loss) are exposed as `computed` signals, so the UI stays in
 * sync automatically without manual change detection or subscriptions.
 *
 * In a real app the seed data and `tickPrices()` below would be replaced by an
 * HttpClient call to a backend / market-data feed; the public API would not change.
 */
@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly holdingsState = signal<Holding[]>(SEED_HOLDINGS);
  private readonly transactionsState = signal<Transaction[]>(SEED_TRANSACTIONS);
  private readonly liveState = signal(false);

  private tickSub?: Subscription;

  /** Raw holdings (read-only to consumers). */
  readonly holdings = this.holdingsState.asReadonly();

  /** Activity history, newest first. */
  readonly transactions = computed(() =>
    [...this.transactionsState()].sort((a, b) => b.date.localeCompare(a.date)),
  );

  /** Whether the simulated price feed is currently running. */
  readonly isLive = this.liveState.asReadonly();

  /** Holdings enriched with market value / gain-loss / weight, richest first. */
  readonly holdingViews = computed<HoldingView[]>(() => {
    const total = this.totalMarketValue();
    return this.holdingsState()
      .map((h) => {
        const marketValue = h.quantity * h.currentPrice;
        const costBasis = h.quantity * h.avgCost;
        const gainLoss = marketValue - costBasis;
        return {
          ...h,
          marketValue,
          costBasis,
          gainLoss,
          gainLossPct: costBasis === 0 ? 0 : gainLoss / costBasis,
          weight: total === 0 ? 0 : marketValue / total,
        };
      })
      .sort((a, b) => b.marketValue - a.marketValue);
  });

  /** Headline numbers for the summary cards. */
  readonly summary = computed<PortfolioSummary>(() => {
    const views = this.holdingViews();
    const totalValue = views.reduce((sum, h) => sum + h.marketValue, 0);
    const totalCost = views.reduce((sum, h) => sum + h.costBasis, 0);
    const totalGainLoss = totalValue - totalCost;
    return {
      totalValue,
      totalCost,
      totalGainLoss,
      totalGainLossPct: totalCost === 0 ? 0 : totalGainLoss / totalCost,
      holdingsCount: views.length,
    };
  });

  /** Market value grouped by asset class, largest slice first. */
  readonly allocation = computed<AllocationSlice[]>(() => {
    const total = this.totalMarketValue();
    const byClass = new Map<AssetClass, number>();
    for (const h of this.holdingViews()) {
      byClass.set(h.assetClass, (byClass.get(h.assetClass) ?? 0) + h.marketValue);
    }
    return [...byClass.entries()]
      .map(([assetClass, value]) => ({
        assetClass,
        value,
        weight: total === 0 ? 0 : value / total,
      }))
      .sort((a, b) => b.value - a.value);
  });

  private readonly totalMarketValue = computed(() =>
    this.holdingsState().reduce((sum, h) => sum + h.quantity * h.currentPrice, 0),
  );

  /**
   * Add a new holding (or top up an existing one) and log a BUY transaction.
   * Average cost is recalculated when adding to an existing position.
   */
  addHolding(input: NewHoldingInput): void {
    const symbol = input.symbol.trim().toUpperCase();

    this.holdingsState.update((holdings) => {
      const existing = holdings.find((h) => h.symbol === symbol);
      if (existing) {
        const totalQty = existing.quantity + input.quantity;
        const blendedCost =
          (existing.quantity * existing.avgCost + input.quantity * input.price) / totalQty;
        return holdings.map((h) =>
          h.symbol === symbol
            ? { ...h, quantity: totalQty, avgCost: blendedCost, currentPrice: input.price }
            : h,
        );
      }
      return [
        ...holdings,
        {
          id: crypto.randomUUID(),
          symbol,
          name: input.name.trim(),
          assetClass: input.assetClass,
          quantity: input.quantity,
          avgCost: input.price,
          currentPrice: input.price,
        },
      ];
    });

    this.logTransaction('BUY', symbol, input.quantity, input.price);
  }

  /** Sell (reduce or remove) a position and log a SELL transaction. */
  sellHolding(id: string, quantity: number): void {
    const holding = this.holdingsState().find((h) => h.id === id);
    if (!holding) return;

    const soldQty = Math.min(quantity, holding.quantity);
    this.holdingsState.update((holdings) =>
      holdings
        .map((h) => (h.id === id ? { ...h, quantity: h.quantity - soldQty } : h))
        .filter((h) => h.quantity > 0),
    );

    this.logTransaction('SELL', holding.symbol, soldQty, holding.currentPrice);
  }

  /** Toggle the simulated real-time price feed on/off. */
  toggleLivePrices(): void {
    if (this.liveState()) {
      this.tickSub?.unsubscribe();
      this.tickSub = undefined;
      this.liveState.set(false);
      return;
    }
    this.liveState.set(true);
    this.tickSub = interval(1500).subscribe(() => this.tickPrices());
  }

  /** Nudge every price by a small random amount to mimic a market data stream. */
  tickPrices(): void {
    this.holdingsState.update((holdings) =>
      holdings.map((h) => {
        if (h.assetClass === 'Cash') return h;
        const drift = 1 + (Math.random() - 0.5) * 0.02; // ±1%
        return { ...h, currentPrice: round2(h.currentPrice * drift) };
      }),
    );
  }

  private logTransaction(
    type: Transaction['type'],
    symbol: string,
    quantity: number,
    price: number,
  ): void {
    this.transactionsState.update((txns) => [
      {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        type,
        symbol,
        quantity,
        price,
      },
      ...txns,
    ]);
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

const SEED_HOLDINGS: Holding[] = [
  { id: '1', symbol: 'AAPL', name: 'Apple Inc.', assetClass: 'Equity', quantity: 40, avgCost: 165.2, currentPrice: 227.5 },
  { id: '2', symbol: 'MSFT', name: 'Microsoft Corp.', assetClass: 'Equity', quantity: 25, avgCost: 310.0, currentPrice: 421.9 },
  { id: '3', symbol: 'FXAIX', name: 'Fidelity 500 Index Fund', assetClass: 'ETF', quantity: 120, avgCost: 150.4, currentPrice: 189.75 },
  { id: '4', symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', assetClass: 'ETF', quantity: 60, avgCost: 210.0, currentPrice: 268.3 },
  { id: '5', symbol: 'BND', name: 'Vanguard Total Bond Market ETF', assetClass: 'Bond', quantity: 80, avgCost: 74.5, currentPrice: 72.1 },
  { id: '6', symbol: 'NVDA', name: 'NVIDIA Corp.', assetClass: 'Equity', quantity: 15, avgCost: 95.0, currentPrice: 138.6 },
  { id: '7', symbol: 'CASH', name: 'Cash & Money Market', assetClass: 'Cash', quantity: 1, avgCost: 8500, currentPrice: 8500 },
];

const SEED_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '2026-09-02T14:31:00Z', type: 'BUY', symbol: 'NVDA', quantity: 15, price: 95.0 },
  { id: 't2', date: '2026-09-15T13:05:00Z', type: 'BUY', symbol: 'AAPL', quantity: 10, price: 171.4 },
  { id: 't3', date: '2026-09-28T09:45:00Z', type: 'DIVIDEND', symbol: 'FXAIX', quantity: 120, price: 0.42 },
  { id: 't4', date: '2026-10-01T15:12:00Z', type: 'SELL', symbol: 'MSFT', quantity: 5, price: 415.0 },
];
