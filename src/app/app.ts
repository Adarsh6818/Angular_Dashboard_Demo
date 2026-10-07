import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PortfolioService } from './services/portfolio.service';

/**
 * Application shell: top bar with the live portfolio value + a simulated market
 * feed toggle, primary navigation, and the routed view outlet.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CurrencyPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly portfolio = inject(PortfolioService);

  protected readonly summary = this.portfolio.summary;
  protected readonly isLive = this.portfolio.isLive;

  protected toggleLive(): void {
    this.portfolio.toggleLivePrices();
  }
}
