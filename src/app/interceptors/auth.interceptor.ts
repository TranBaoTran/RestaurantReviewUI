import { HttpInterceptorFn } from '@angular/common/http';
import { SecureStorageService } from '../services/secure-storage.service';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const secureStorageService = inject(SecureStorageService);
  const token = secureStorageService.getToken(); 
  const clonedReq = req.clone({
    setHeaders:{
      Authorization : `Bearer ${token}`
    }
  })
  return next(clonedReq);
};
