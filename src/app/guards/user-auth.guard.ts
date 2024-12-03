import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { SecureStorageService } from '../services/secure-storage.service';
import { AuthService } from '../services/auth.service';

export const userAuthGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const secureStorageService = inject(SecureStorageService);
  const router = inject(Router);
  const adminAuth = inject(AuthService);

  if (userService.isLoggedIn() && secureStorageService.getRole() == "US" || adminAuth.isAdmin()){
    return true;
  }else{
    router.navigate(['']);
    return false;
  }
};
