import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth';
import { map, tap } from 'rxjs';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  console.log('🛡️ GuestGuard - Verificando si es invitado');

  return auth.me().pipe(
    tap(user => console.log('🛡️ GuestGuard - Usuario:', user)),
    map((user) => {
      if (user) {
        console.log('✅ GuestGuard - Ya autenticado, redirigiendo a /debts');
        router.navigate(['/debts']);
        return false;
      }
      console.log('✅ GuestGuard - No autenticado, permitiendo acceso');
      return true;
    }),
  );
};