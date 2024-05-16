import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { catchError, of, switchMap } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  return authService.getCurrentUser().pipe(
    switchMap( res => {
      if (res) {
        return of(true);
      } else {
        return of(router.parseUrl('/login'));
      }
    })
  );
};
