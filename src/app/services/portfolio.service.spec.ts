import { TestBed } from '@angular/core/testing';
import { PortfolioService } from './portfolio.service';

describe('PortfolioService', () => {
  let service: PortfolioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PortfolioService);
  });

  it('computes a summary whose total value equals the sum of holding market values', () => {
    const expected = service
      .holdingViews()
      .reduce((sum, h) => sum + h.marketValue, 0);
    expect(service.summary().totalValue).toBeCloseTo(expected, 2);
  });

  it('derives gain/loss percentage from cost basis', () => {
    const view = service.holdingViews().find((h) => h.symbol === 'AAPL');
    expect(view).toBeDefined();
    const expectedPct = view!.gainLoss / view!.costBasis;
    expect(view!.gainLossPct).toBeCloseTo(expectedPct, 6);
  });

  it('adds a new holding and records a BUY transaction', () => {
    const before = service.holdingViews().length;
    service.addHolding({
      symbol: 'tsla',
      name: 'Tesla Inc.',
      assetClass: 'Equity',
      quantity: 10,
      price: 250,
    });

    const added = service.holdingViews().find((h) => h.symbol === 'TSLA');
    expect(service.holdingViews().length).toBe(before + 1);
    expect(added?.quantity).toBe(10);

    const latest = service.transactions()[0];
    expect(latest.type).toBe('BUY');
    expect(latest.symbol).toBe('TSLA');
    expect(latest.quantity).toBe(10);
  });

  it('blends average cost when topping up an existing position', () => {
    service.addHolding({
      symbol: 'NVDA',
      name: 'NVIDIA Corp.',
      assetClass: 'Equity',
      quantity: 15,
      price: 145,
    });
    const nvda = service.holdingViews().find((h) => h.symbol === 'NVDA');
    // Seed: 15 @ 95 blended with 15 @ 145 => avg cost 120, qty 30.
    expect(nvda?.quantity).toBe(30);
    expect(nvda?.avgCost).toBeCloseTo(120, 6);
  });

  it('updates an existing holding in place', () => {
    const aapl = service.holdingViews().find((h) => h.symbol === 'AAPL')!;
    service.updateHolding(aapl.id, {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      assetClass: 'Equity',
      quantity: 50,
      price: 200,
    });
    const updated = service.holdingViews().find((h) => h.id === aapl.id);
    expect(updated?.quantity).toBe(50);
    expect(updated?.currentPrice).toBe(200);
    expect(updated?.marketValue).toBeCloseTo(50 * 200, 2);
  });

  it('removes a position when fully sold and logs a SELL', () => {
    const nvda = service.holdingViews().find((h) => h.symbol === 'NVDA')!;
    service.sellHolding(nvda.id, nvda.quantity);
    expect(service.holdingViews().some((h) => h.symbol === 'NVDA')).toBe(false);

    const latest = service.transactions()[0];
    expect(latest.type).toBe('SELL');
    expect(latest.symbol).toBe('NVDA');
  });
});
