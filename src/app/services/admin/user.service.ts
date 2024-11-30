import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { User } from '../../models/admin/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
    private apiUrlUser = 'http://localhost:5043/User';

    constructor(private http: HttpClient) { }

     // User
     getUsers(): Observable<any> {
        return this.http.get<any>(this.apiUrlUser);
    }
    
    getLockedUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrlUser}/locked`);
    }
    
    getUserById(userId: number): Observable<User | null> {
        return this.http.get<User>(`${this.apiUrlUser}/${userId}`).pipe(
            catchError(error => {
            if (error.status === 404) {
                // Handle not found (e.g., return null or show an alert)
                return of(null);
            } else {
                // Handle other potential errors
                throw error;
            }
            })
        );
    }
    
    // Khóa tài khoản người dùng
    lockUser(userId: number): Observable<any> {
        return this.http.put<any>(`${this.apiUrlUser}/lock/${userId}`, null).pipe(
            catchError(error => {
            // Xử lý lỗi nếu có
            if (error.status === 404) {
                console.error('User not found');
            } else if (error.status === 400) {
                console.error('User is already locked');
            }
            return of(null); // Trả về null nếu có lỗi
            })
        );
    }

    // Mo khóa tài khoản người dùng
    unLockUser(userId: number): Observable<any> {
        return this.http.put<any>(`${this.apiUrlUser}/unlock/${userId}`, null).pipe(
            catchError(error => {
            // Xử lý lỗi nếu có
            if (error.status === 404) {
                console.error('User not found');
            } else if (error.status === 400) {
                console.error('User is already unlock');
            }
            return of(null); // Trả về null nếu có lỗi
            })
        );
    }

    // Phương thức tìm kiếm người dùng
    searchUsers(query: string): Observable<User[]> {
        const params = new HttpParams().set('query', query);
        return this.http.get<User[]>(`${this.apiUrlUser}/search`, { params });
    }

    //Goi API doi mat khau
    changePassword(userId: number, newPassword: string): Observable<void> {
        const request = {
            newPassword: newPassword,
        };
        return this.http.put<void>(`${this.apiUrlUser}/change-password/${userId}`, request);
    }

    // Gọi API tạo người dùng
    createUser(user: User): Observable<any> {
        return this.http.post<any>(this.apiUrlUser, user);
    }
}