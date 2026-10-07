import { Routes } from '@angular/router';

/**
 * Each feature route is lazily loaded with `loadComponent`, so the browser only
 * downloads a view's code when the user navigates to it (route-level code splitting).
 */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Dashboard · Portfolio',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'holdings',
    title: 'Holdings · Portfolio',
    loadComponent: () => import('./features/holdings/holdings').then((m) => m.Holdings),
  },
  {
    path: 'transactions',
    title: 'Transactions · Portfolio',
    loadComponent: () =>
      import('./features/transactions/transactions').then((m) => m.Transactions),
  },
  { path: '**', redirectTo: '' },
];
