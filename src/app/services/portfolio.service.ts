import { computed, Injectable, signal } from '@angular/core';
import { api } from '../core/api';
import { Holding, NewHoldingInput, Transaction } from '../models/portfolio.models';
import { buildAllocation, buildHoldingViews, buildSummary } from './portfolio.logic';

/** Payload returned by the API's holdings mutation endpoints. */
interface PortfolioPayload {
  holdings: Holding[];
  transactions: Transaction[];
}

// Portfolio state: fetches holdings/transactions from the REST API via Axios and exposes them as signals.
@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly holdingsState = signal<Holding[]>([]);
  private readonly transactionsState = signal<Transaction[]>([]);

  /** True once the first load has finished (used to show a loading state). */
  readonly ready = signal(false);
  /** Last error message, if a request failed. */
  readonly error = signal<string | null>(null);

  readonly holdings = this.holdingsState.asReadonly();
  readonly transactions = this.transactionsState.asReadonly();

  /** Holdings enriched with market value / gain-loss / weight (derived, always in sync). */
  readonly holdingViews = computed(() => buildHoldingViews(this.holdingsState()));
  readonly summary = computed(() => buildSummary(this.holdingViews()));
  readonly allocation = computed(() => buildAllocation(this.holdingViews()));

  /** Load holdings and transactions from the API. */
  async loadAll(): Promise<void> {
    try {
      const [holdings, transactions] = await Promise.all([
        api.get<Holding[]>('/holdings'),
        api.get<Transaction[]>('/transactions'),
      ]);
      this.holdingsState.set(Array.isArray(holdings.data) ? holdings.data : []);
      this.transactionsState.set(Array.isArray(transactions.data) ? transactions.data : []);
      this.error.set(null);
    } catch {
      this.error.set('Could not load portfolio data. Is the API server running?');
    } finally {
      this.ready.set(true);
    }
  }

  /** CREATE: add a new holding (or top up an existing one). */
  async addHolding(input: NewHoldingInput): Promise<void> {
    const { data } = await api.post<PortfolioPayload>('/holdings', input);
    this.applyPayload(data);
  }

  /** UPDATE: edit an existing holding. */
  async updateHolding(id: string, input: NewHoldingInput): Promise<void> {
    const { data } = await api.put<PortfolioPayload>(`/holdings/${id}`, input);
    this.applyPayload(data);
  }

  /** DELETE: sell (reduce or remove) a position. */
  async sellHolding(id: string, quantity: number): Promise<void> {
    const { data } = await api.post<PortfolioPayload>(`/holdings/${id}/sell`, { quantity });
    this.applyPayload(data);
  }

  private applyPayload(payload: PortfolioPayload): void {
    this.holdingsState.set(payload.holdings);
    this.transactionsState.set(payload.transactions);
  }
}
