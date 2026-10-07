import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PortfolioService } from './services/portfolio.service';
import { ProfileService } from './services/profile.service';

// Application shell: top bar with live portfolio value + profile chip, nav, and routed view.
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CurrencyPipe],
  templateUrl: './app.html',
})
export class App {
  private readonly portfolio = inject(PortfolioService);
  private readonly profileService = inject(ProfileService);

  protected readonly summary = this.portfolio.summary;
  protected readonly profile = this.profileService.profile;
  protected readonly initials = this.profileService.initials;
}
