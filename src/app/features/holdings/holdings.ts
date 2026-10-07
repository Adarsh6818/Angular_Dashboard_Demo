import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PortfolioService } from '../../services/portfolio.service';
import { AssetClass } from '../../models/portfolio.models';

@Component({
  selector: 'app-holdings',
  imports: [ReactiveFormsModule, CurrencyPipe, DecimalPipe, PercentPipe],
  templateUrl: './holdings.html',
  styleUrl: './holdings.scss',
})
export class Holdings {
  private readonly portfolio = inject(PortfolioService);
  private readonly fb = inject(FormBuilder);

  /** Reactive signal of enriched holdings (re-read automatically by the template). */
  protected readonly holdings = this.portfolio.holdingViews;
  protected readonly assetClasses: AssetClass[] = ['Equity', 'ETF', 'Bond', 'Cash', 'Crypto'];

  protected readonly showForm = signal(false);

  /** Typed, validated reactive form for adding / topping up a position. */
  protected readonly form = this.fb.nonNullable.group({
    symbol: ['', [Validators.required, Validators.pattern(/^[A-Za-z.]{1,6}$/)]],
    name: ['', [Validators.required, Validators.minLength(2)]],
    assetClass: ['Equity' as AssetClass, Validators.required],
    quantity: [0, [Validators.required, Validators.min(0.0001)]],
    price: [0, [Validators.required, Validators.min(0.01)]],
  });

  protected toggleForm(): void {
    this.showForm.update((v) => !v);
    if (!this.showForm()) this.form.reset({ assetClass: 'Equity', quantity: 0, price: 0 });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.portfolio.addHolding(value);
    this.form.reset({ assetClass: 'Equity', quantity: 0, price: 0 });
    this.showForm.set(false);
  }

  protected sell(id: string): void {
    const holding = this.holdings().find((h) => h.id === id);
    if (!holding) return;
    const input = prompt(`Sell how many units of ${holding.symbol}? (max ${holding.quantity})`);
    const qty = Number(input);
    if (Number.isFinite(qty) && qty > 0) {
      this.portfolio.sellHolding(id, qty);
    }
  }

  /** Field-level helper for template error messages. */
  protected invalid(control: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[control];
    return c.invalid && (c.touched || c.dirty);
  }
}
