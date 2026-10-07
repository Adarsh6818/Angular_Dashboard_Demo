/**
 * Domain models for the portfolio dashboard.
 * Kept framework-agnostic so they can be shared across services, components and tests.
 */

export type AssetClass = 'Equity' | 'ETF' | 'Bond' | 'Cash' | 'Crypto';

export type TransactionType = 'BUY' | 'SELL' | 'DIVIDEND';

/** A single position the investor holds. */
export interface Holding {
  id: string;
  symbol: string;
  name: string;
  assetClass: AssetClass;
  quantity: number;
  /** Average cost per share/unit the investor paid. */
  avgCost: number;
  /** Latest market price per share/unit. */
  currentPrice: number;
}

/** A holding enriched with the figures the UI actually renders. */
export interface HoldingView extends Holding {
  marketValue: number;
  costBasis: number;
  gainLoss: number;
  gainLossPct: number;
  /** Share of the total portfolio market value, 0–1. */
  weight: number;
}

/** An entry in the account's activity history. */
export interface Transaction {
  id: string;
  date: string; // ISO-8601
  type: TransactionType;
  symbol: string;
  quantity: number;
  price: number;
}

/** Roll-up figures shown on the dashboard summary cards. */
export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPct: number;
  holdingsCount: number;
}

/** Per-asset-class breakdown for the allocation view. */
export interface AllocationSlice {
  assetClass: AssetClass;
  value: number;
  weight: number; // 0–1
}

/** Shape of the "add holding" reactive form once validated. */
export interface NewHoldingInput {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  quantity: number;
  price: number;
}
