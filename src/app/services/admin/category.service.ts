import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Category } from '../../models/admin/category.model'; // Import model cho Category

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:5043/Category'; // Địa chỉ API cho Category

  constructor(private http: HttpClient) {}

  // Lấy danh sách tất cả các danh mục
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error fetching categories:', error);
        return of([]); // Trả về danh sách rỗng nếu lỗi
      })
    );
  }

  // Lấy thông tin một danh mục theo ID
  getCategoryById(categoryId: number): Observable<Category | null> {
    return this.http.get<Category>(`${this.apiUrl}/${categoryId}`).pipe(
      catchError(error => {
        if (error.status === 404) {
          console.warn('Category not found:', categoryId);
          return of(null); // Trả về null nếu không tìm thấy
        } else {
          console.error('Error fetching category:', error);
          throw error;
        }
      })
    );
  }

  // Tạo mới một danh mục
  createCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category).pipe(
      catchError(error => {
        console.error('Error creating category:', error);
        throw error;
      })
    );
  }

  // Cập nhật thông tin một danh mục
  updateCategory(categoryId: number, category: Category): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${categoryId}`, category).pipe(
      catchError(error => {
        console.error('Error updating category:', error);
        throw error;
      })
    );
  }

  // Xóa một danh mục
  deleteCategory(categoryId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${categoryId}`).pipe(
      catchError(error => {
        console.error('Error deleting category:', error);
        throw error;
      })
    );
  }

  // Tìm kiếm danh mục theo từ khóa
  searchCategories(query: string): Observable<Category[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<Category[]>(`${this.apiUrl}/search`, { params }).pipe(
      catchError(error => {
        console.error('Error searching categories:', error);
        return of([]); // Trả về danh sách rỗng nếu lỗi
      })
    );
  }
}
