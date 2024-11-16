import { Injectable } from '@angular/core';
import CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {
  private tokenKey = 'token';
  private userIdKey = 'userid';
  private roleKey = 'roleid';
  private secretKey = 'whatevermakeyouhappyiguess';

  setToken(token: string): void {
    const encryptedToken = CryptoJS.AES.encrypt(token, this.secretKey).toString();
    localStorage.setItem(this.tokenKey, encryptedToken);
  }

  getToken(): string | null {
    const encryptedToken = localStorage.getItem(this.tokenKey);
    if (encryptedToken) {
      return CryptoJS.AES.decrypt(encryptedToken, this.secretKey).toString(CryptoJS.enc.Utf8);
    }
    return null;
  }

  setUserId(userId: string): void {
    const encryptedId = CryptoJS.AES.encrypt(userId, this.secretKey).toString();
    localStorage.setItem(this.userIdKey, encryptedId);
  }

  getUserId(): string | null {
    const encryptedId = localStorage.getItem(this.userIdKey);
    if (encryptedId) {
      return CryptoJS.AES.decrypt(encryptedId, this.secretKey).toString(CryptoJS.enc.Utf8);
    }
    return null;
  }

  setRole(role: string): void {
    const encryptedRole = CryptoJS.AES.encrypt(role, this.secretKey).toString();
    localStorage.setItem(this.roleKey, encryptedRole);
  }

  getRole(): string | null {
    const encryptedRole = localStorage.getItem(this.roleKey);
    if (encryptedRole) {
      return CryptoJS.AES.decrypt(encryptedRole, this.secretKey).toString(CryptoJS.enc.Utf8);
    }
    return null;
  }

  clearStorage(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userIdKey);
    localStorage.removeItem(this.roleKey);
  }
}
