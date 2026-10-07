import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe, PercentPipe } from '@angular/common';
import { PortfolioService } from '../../services/portfolio.service';
import { AssetClass } from '../../models/portfolio.models';

// Dashboard view: shows portfolio summary cards, asset allocation and top holdings.
@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, PercentPipe],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly portfolio = inject(PortfolioService);

  protected readonly summary = this.portfolio.summary;
  protected readonly allocation = this.portfolio.allocation;

  /** Five largest positions by market value. */
  protected readonly topHoldings = computed(() => this.portfolio.holdingViews().slice(0, 5));

  protected colorFor(assetClass: AssetClass): string {
    return ASSET_COLORS[assetClass];
  }
}

const ASSET_COLORS: Record<AssetClass, string> = {
  Equity: '#047857',
  ETF: '#10b981',
  Bond: '#4f86c6',
  Cash: '#94a3b8',
  Crypto: '#d08700',
};
