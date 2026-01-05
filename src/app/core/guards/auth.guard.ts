import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth';
import { map, tap } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  console.log('🛡️ AuthGuard - Verificando autenticación');

  return auth.me().pipe(
    tap(user => console.log('🛡️ AuthGuard - Usuario:', user)),
    map((user) => {
      if (!user) {
        console.log('❌ AuthGuard - No autenticado, redirigiendo a login');
        router.navigate(['/auth/login']);
        return false;
      }
      console.log('✅ AuthGuard - Autenticado, permitiendo acceso');
      return true;
    }),
  );
};