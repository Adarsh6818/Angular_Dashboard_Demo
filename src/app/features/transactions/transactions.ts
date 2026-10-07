import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { PortfolioService } from '../../services/portfolio.service';
import { TransactionType } from '../../models/portfolio.models';

type Filter = 'ALL' | TransactionType;

// Transactions view: shows the activity history with a filter by transaction type.
@Component({
  selector: 'app-transactions',
  imports: [CurrencyPipe, DatePipe, DecimalPipe],
  templateUrl: './transactions.html',
})
export class Transactions {
  private readonly portfolio = inject(PortfolioService);

  protected readonly ready = this.portfolio.ready;
  protected readonly error = this.portfolio.error;
  protected readonly filters: Filter[] = ['ALL', 'BUY', 'SELL', 'DIVIDEND'];
  protected readonly activeFilter = signal<Filter>('ALL');

  /** Transactions narrowed to the selected type (reactively recomputed). */
  protected readonly visible = computed(() => {
    const filter = this.activeFilter();
    const all = this.portfolio.transactions();
    return filter === 'ALL' ? all : all.filter((t) => t.type === filter);
  });

  protected setFilter(filter: Filter): void {
    this.activeFilter.set(filter);
  }

  protected amount(quantity: number, price: number): number {
    return quantity * price;
  }

  protected badgeClass(type: TransactionType): string {
    return `badge badge-${type.toLowerCase()}`;
  }
}
