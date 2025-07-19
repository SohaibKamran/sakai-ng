// src/app/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService); // Inject AuthService here
  const authToken = authService.getToken(); // Assuming AuthService has a method to get the token

  // Clone the request and add the Authorization header if a token exists
  if (authToken) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${authToken}`)
    });
    return next(cloned);
  }

  // If no token, just pass the original request along
  return next(req);
};