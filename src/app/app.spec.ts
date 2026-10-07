import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { PortfolioService } from './services/portfolio.service';
import { ProfileService } from './services/profile.service';

// Stub the services so the shell renders without making real Axios/API calls.
const portfolioStub = {
  summary: signal({
    totalValue: 0,
    totalCost: 0,
    totalGainLoss: 0,
    totalGainLossPct: 0,
    holdingsCount: 0,
  }),
  loadAll: () => Promise.resolve(),
};

const profileStub = {
  profile: signal({ fullName: 'Test User', addressLine1: '', city: '', country: '', contacts: [] }),
  initials: signal('TU'),
  load: () => Promise.resolve(),
};

describe('App shell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: PortfolioService, useValue: portfolioStub },
        { provide: ProfileService, useValue: profileStub },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the brand name', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Portfolio');
  });

  it('should render the primary navigation', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const links = (fixture.nativeElement as HTMLElement).querySelectorAll('nav a');
    expect(links.length).toBe(4);
  });

  it('should show the profile initials in the top bar', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('TU');
  });
});
