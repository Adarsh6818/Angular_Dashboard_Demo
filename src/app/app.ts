import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PortfolioService } from './services/portfolio.service';
import { ProfileService } from './services/profile.service';

// Application shell: loads data on startup, renders the top bar + profile chip, nav and routed view.
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CurrencyPipe],
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly portfolio = inject(PortfolioService);
  private readonly profileService = inject(ProfileService);

  protected readonly summary = this.portfolio.summary;
  protected readonly profile = this.profileService.profile;
  protected readonly initials = this.profileService.initials;

  ngOnInit(): void {
    // Fetch the initial data from the REST API once, when the app boots.
    void this.portfolio.loadAll();
    void this.profileService.load();
  }
}
