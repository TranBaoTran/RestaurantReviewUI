import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Login, LoginResponse, Signup, User } from '../models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5043/User';
  private apiLoginUrl = 'http://localhost:5043/Auth';

  constructor(private http: HttpClient) { }

  userLogIn(data : Login): Observable<LoginResponse>{
    return this.http.post<LoginResponse>(`${this.apiLoginUrl}/login`, data);
  }

  userSignUp(data : Signup): Observable<LoginResponse>{
    return this.http.post<LoginResponse>(`${this.apiLoginUrl}/signup`, data);
  }

  userGGLogin(data : {idToken : string}): Observable<LoginResponse>{
    return this.http.post<LoginResponse>(`${this.apiLoginUrl}/GGlogin`, data);
  }

  getUserById(id : number): Observable<User>{
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  isLoggedIn(): boolean{
    return !!localStorage.getItem('token');
  }

  getFavoriteRestaurantIds(id : number): Observable<{resId: { id: number }[]}> {
    return this.http.get<{resId: { id: number }[]}>(`${this.apiUrl}/UserFavouriteRetaurant/${id}`);
  }
  
  getReviewdRestaurantIds(id : number): Observable<{resId: { id: number }[]}> {
    return this.http.get<{resId: { id: number }[]}>(`${this.apiUrl}/UserReviewedRetaurant/${id}`);
  }

  addFavRestaurant(userid : number, resid : number): Observable<{message : string}> {
    return this.http.post<{message : string}>(`${this.apiUrl}/AddFavouriteRestaurant/${userid}/${resid}`, null);
  }

  removeFavRestaurant(userid : number, resid : number): Observable<{message : string}> {
    return this.http.post<{message : string}>(`${this.apiUrl}/RemoveFavouriteRestaurant/${userid}/${resid}`, null);
  }

  changeAvatar(userid : number, formData : FormData): Observable<{message : string}> {
    return this.http.post<{message : string}>(`${this.apiUrl}/ChangeAvt/${userid}`, formData);
  }
  
  editUserInfo(userid : number, name : string, phone : string): Observable<{message : string}> {
    return this.http.post<{message : string}>(`${this.apiUrl}/EditUserInfo/${userid}/${name}/${phone}`, null);
  }

  getAllUser(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}`);
  }

  lockUser(userId : number): Observable<{message : string}> {
    return this.http.put<{message : string}>(`${this.apiUrl}/lock/${userId}`, null);
  }

  unlockUser(userId : number): Observable<{message : string}> {
    return this.http.put<{message : string}>(`${this.apiUrl}/unlock/${userId}`, null);
  }

  addNewAdmin(formData : FormData): Observable<{message : string}> {
    return this.http.post<{message : string}>(`${this.apiUrl}/AddNewAdmin`, formData);
  }
}
