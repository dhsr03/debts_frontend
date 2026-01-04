import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'debts',
    pathMatch: 'full',
  },
  {
    path: 'auth/login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/login/login')
        .then(m => m.LoginComponent),
  },
  {
    path: 'auth/register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/register/register')
        .then(m => m.RegisterComponent),
  },
  {
    path: 'debts',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/debts/pages/debts-list/debts-list')
        .then(m => m.DebtsListComponent),
  },
  {
    path: '**',
    redirectTo: 'debts',
  },
];
