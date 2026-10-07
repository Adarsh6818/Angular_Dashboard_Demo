// Pure, framework-free functions that derive view data from raw holdings (easy to unit test).
import {
  AllocationSlice,
  AssetClass,
  Holding,
  HoldingView,
  PortfolioSummary,
} from '../models/portfolio.models';

/** Enrich one holding with market value, cost basis, gain/loss and portfolio weight. */
export function toHoldingView(holding: Holding, totalMarketValue: number): HoldingView {
  const marketValue = holding.quantity * holding.currentPrice;
  const costBasis = holding.quantity * holding.avgCost;
  const gainLoss = marketValue - costBasis;
  return {
    ...holding,
    marketValue,
    costBasis,
    gainLoss,
    gainLossPct: costBasis === 0 ? 0 : gainLoss / costBasis,
    weight: totalMarketValue === 0 ? 0 : marketValue / totalMarketValue,
  };
}

/** Build the enriched, market-value-sorted list of holdings. */
export function buildHoldingViews(holdings: Holding[]): HoldingView[] {
  if (!Array.isArray(holdings)) return [];
  const total = holdings.reduce((sum, h) => sum + h.quantity * h.currentPrice, 0);
  return holdings
    .map((h) => toHoldingView(h, total))
    .sort((a, b) => b.marketValue - a.marketValue);
}

/** Roll up the summary figures shown on the dashboard cards. */
export function buildSummary(views: HoldingView[]): PortfolioSummary {
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
}

/** Group market value by asset class, largest slice first. */
export function buildAllocation(views: HoldingView[]): AllocationSlice[] {
  const total = views.reduce((sum, h) => sum + h.marketValue, 0);
  const byClass = new Map<AssetClass, number>();
  for (const h of views) {
    byClass.set(h.assetClass, (byClass.get(h.assetClass) ?? 0) + h.marketValue);
  }
  return [...byClass.entries()]
    .map(([assetClass, value]) => ({
      assetClass,
      value,
      weight: total === 0 ? 0 : value / total,
    }))
    .sort((a, b) => b.value - a.value);
}
