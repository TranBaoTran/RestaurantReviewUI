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
    
    getCategoryId(categoryId: number): Observable<Category> {
        return this.http.get<Category>(`${this.apiUrl}/${categoryId}`);
    }

    createCategory(cate : {name : string ,isActive : true}): Observable<{message : string}> {
        return this.http.post<{message : string}>(`${this.apiUrl}/CreateCategory`, cate);
    }

    updateCategory(cateId : number, cateName : string): Observable<{message : string}> {
        return this.http.post<{message : string}>(`${this.apiUrl}/UpdateCategoryName/${cateId}/${cateName}`, null);
    }

    deleteCategory(cateId : number): Observable<{message : string}> {
        return this.http.post<{message : string}>(`${this.apiUrl}/DeleteCategory/${cateId}`, null);
    }
}