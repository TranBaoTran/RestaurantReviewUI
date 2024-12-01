import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.isLoggedIn() && authService.isAdmin()) {
    return true;
  } else {
    console.warn('Access denied - Admins only');
    router.navigate(['/']); 
    return false;
  }
};
