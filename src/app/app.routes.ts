import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/pages/login/login')
        .then(m => m.LoginComponent),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/pages/register/register')
        .then(m => m.RegisterComponent),
  },
  {
    path: 'debts',
    loadComponent: () =>
      import('./features/debts/pages/debts-list/debts-list')
        .then(m => m.DebtsListComponent),
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
