import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PortfolioService } from '../../services/portfolio.service';
import { AssetClass, HoldingView } from '../../models/portfolio.models';

// Holdings view: lists every position and provides full CRUD (add, edit, sell) via a reactive form.
@Component({
  selector: 'app-holdings',
  imports: [ReactiveFormsModule, CurrencyPipe, DecimalPipe, PercentPipe],
  templateUrl: './holdings.html',
})
export class Holdings {
  private readonly portfolio = inject(PortfolioService);
  private readonly fb = inject(FormBuilder);

  /** Reactive signal of enriched holdings (re-read automatically by the template). */
  protected readonly holdings = this.portfolio.holdingViews;
  protected readonly ready = this.portfolio.ready;
  protected readonly error = this.portfolio.error;
  protected readonly assetClasses: AssetClass[] = ['Equity', 'ETF', 'Bond', 'Cash', 'Crypto'];

  protected readonly showForm = signal(false);
  /** Id of the holding being edited, or null when adding a new one. */
  protected readonly editingId = signal<string | null>(null);

  /** Typed, validated reactive form used for both creating and editing a position. */
  protected readonly form = this.fb.nonNullable.group({
    symbol: ['', [Validators.required, Validators.pattern(/^[A-Za-z.]{1,6}$/)]],
    name: ['', [Validators.required, Validators.minLength(2)]],
    assetClass: ['Equity' as AssetClass, Validators.required],
    quantity: [0, [Validators.required, Validators.min(0.0001)]],
    price: [0, [Validators.required, Validators.min(0.01)]],
  });

  /** Open an empty form in "add" mode. */
  protected startAdd(): void {
    this.editingId.set(null);
    this.form.reset({ assetClass: 'Equity', quantity: 0, price: 0 });
    this.showForm.set(true);
  }

  /** Open the form pre-filled in "edit" mode for the given holding. */
  protected startEdit(h: HoldingView): void {
    this.editingId.set(h.id);
    this.form.setValue({
      symbol: h.symbol,
      name: h.name,
      assetClass: h.assetClass,
      quantity: h.quantity,
      price: h.currentPrice,
    });
    this.showForm.set(true);
  }

  protected cancel(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  /** Create a new holding or update the one being edited. */
  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const id = this.editingId();
    try {
      if (id) {
        await this.portfolio.updateHolding(id, value);
      } else {
        await this.portfolio.addHolding(value);
      }
      this.cancel();
    } catch {
      this.error.set('Could not save the holding. Please try again.');
    }
  }

  /** Sell (delete) a position, prompting for the quantity. */
  protected async sell(h: HoldingView): Promise<void> {
    const input = prompt(`Sell how many units of ${h.symbol}? (max ${h.quantity})`);
    const qty = Number(input);
    if (Number.isFinite(qty) && qty > 0) {
      try {
        await this.portfolio.sellHolding(h.id, qty);
      } catch {
        this.error.set('Could not sell the holding. Please try again.');
      }
    }
  }

  /** Field-level helper for template error messages. */
  protected invalid(control: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[control];
    return c.invalid && (c.touched || c.dirty);
  }
}
