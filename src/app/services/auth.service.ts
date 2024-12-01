import { Injectable } from '@angular/core';
import { SecureStorageService } from './secure-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userRole: string = '';

  constructor(private secureStorageService: SecureStorageService) { }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  // Kiểm tra nếu người dùng có quyền admin
  isAdmin(): boolean {
    const roleId = this.secureStorageService.getRole();
    return roleId === 'AD';
  }

  getRole(): string {
    return this.userRole;
  }  
}
