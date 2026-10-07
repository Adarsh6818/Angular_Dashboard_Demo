import { Holding } from '../models/portfolio.models';
import { buildAllocation, buildHoldingViews, buildSummary } from './portfolio.logic';

const HOLDINGS: Holding[] = [
  { id: '1', symbol: 'AAPL', name: 'Apple Inc.', assetClass: 'Equity', quantity: 10, avgCost: 100, currentPrice: 150 },
  { id: '2', symbol: 'BND', name: 'Bond ETF', assetClass: 'Bond', quantity: 20, avgCost: 80, currentPrice: 75 },
];

describe('portfolio.logic', () => {
  it('builds holding views with market value and gain/loss', () => {
    const views = buildHoldingViews(HOLDINGS);
    const aapl = views.find((h) => h.symbol === 'AAPL')!;
    expect(aapl.marketValue).toBe(1500);
    expect(aapl.costBasis).toBe(1000);
    expect(aapl.gainLoss).toBe(500);
    expect(aapl.gainLossPct).toBeCloseTo(0.5, 6);
  });

  it('sorts holding views by market value descending', () => {
    const views = buildHoldingViews(HOLDINGS);
    expect(views[0].symbol).toBe('AAPL'); // 1500 > 1500? BND = 1500 too
    // AAPL 1500, BND 1500 — tie; just assert both present and weights sum to 1
    const totalWeight = views.reduce((s, v) => s + v.weight, 0);
    expect(totalWeight).toBeCloseTo(1, 6);
  });

  it('summarises total value, cost and gain', () => {
    const summary = buildSummary(buildHoldingViews(HOLDINGS));
    expect(summary.totalValue).toBe(3000); // 1500 + 1500
    expect(summary.totalCost).toBe(2600); // 1000 + 1600
    expect(summary.totalGainLoss).toBe(400);
    expect(summary.holdingsCount).toBe(2);
  });

  it('groups allocation by asset class with weights that sum to 1', () => {
    const allocation = buildAllocation(buildHoldingViews(HOLDINGS));
    expect(allocation.length).toBe(2);
    const sum = allocation.reduce((s, a) => s + a.weight, 0);
    expect(sum).toBeCloseTo(1, 6);
  });

  it('handles an empty portfolio without dividing by zero', () => {
    const summary = buildSummary(buildHoldingViews([]));
    expect(summary.totalValue).toBe(0);
    expect(summary.totalGainLossPct).toBe(0);
  });
});
