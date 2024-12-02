import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SecureStorageService } from '../services/secure-storage.service';
import { UserService } from '../services/user.service';

export const adminAuthGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const secureStorageService = inject(SecureStorageService);
  const router = inject(Router);

  if (userService.isLoggedIn() && secureStorageService.getRole() == "AD"){
    return true;
  }else{
    router.navigate(['']);
    return false;
  }
};
