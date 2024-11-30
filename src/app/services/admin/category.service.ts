import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { Category } from '../../models/admin/category.model';


@Injectable({
  providedIn: 'root'
})
export class CategoryService {
    private apiUrl = 'http://localhost:5043/Category';

    constructor(private http: HttpClient) { }

    geCategories(): Observable<any> {
        return this.http.get<any>(this.apiUrl);
    }
    
    getCategoryId(categoryId: number): Observable<Category | null> {
        return this.http.get<Category>(`${this.apiUrl}/${categoryId}`).pipe(
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
    lockCategory(categoryId: number): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/lock/${categoryId}`, null).pipe(
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

    searchCategorys(searchTerm: string): Observable<Category[]> {
        return this.http.get<Category[]>(`${this.apiUrl}/search?searchTerm=${searchTerm}`);
    }
}