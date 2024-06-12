import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

import { routes } from './app.routes';
import { cookieAuthInterceptor } from './interceptors/cookie-auth.interceptor';
import { jwtAuthInterceptor } from './interceptors/jwt-auth.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([
      cookieAuthInterceptor,
      jwtAuthInterceptor
    ])),
    CookieService, provideAnimationsAsync()
  ]
};
