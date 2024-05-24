import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const jwtAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  if (authService.isLoggedIn()) {
    return next(req.clone({
      setHeaders: {
        Authorization: `Bearer ${authService.accessToken?.token}`
      }
    }));
  }

  return next(req);
};
