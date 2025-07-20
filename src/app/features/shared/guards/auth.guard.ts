import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard: Prevents access to routes if the user is NOT logged in.
 * Redirects to login page if not authenticated.
 */
export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn()) {
        return true;
    } else {
        router.navigate(['/login']);
        return false;
    }
};

/**
 * Auth Guard Child: Reuses the logic of authGuard for child routes.
 */
export const authGuardChild: CanActivateChildFn = (childRoute, state) => {
    return authGuard(childRoute, state);
};

/**
 * Public Guard: Prevents access to routes (like login/register) if the user IS logged in.
 * Redirects to dashboard if authenticated.
 */
export const publicGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn()) {
        router.navigate(['/dashboard']);
        return false;
    } else {
        return true;
    }
};