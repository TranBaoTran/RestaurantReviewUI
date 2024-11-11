import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Login, LoginResponse } from '../models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiLoginUrl = 'http://localhost:5043/Auth/login';

  constructor(private http: HttpClient) { }

  userLogIn(data : Login): Observable<LoginResponse>{
    return this.http.post<LoginResponse>(this.apiLoginUrl, data);
  }

  isLoggedIn(): boolean{
    return !!localStorage.getItem('token');
  }

  logOut(): void{
    localStorage.removeItem('token');
    localStorage.removeItem('userid');
    localStorage.removeItem('roleid');
  }
}
