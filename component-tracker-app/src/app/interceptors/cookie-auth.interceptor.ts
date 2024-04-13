import { HttpInterceptorFn } from '@angular/common/http';

export const cookieAuthInterceptor: HttpInterceptorFn = (req, next) => {
  // Add 'withCredentials' to all requests
  return next(req.clone({
    withCredentials: true
  }));
};
