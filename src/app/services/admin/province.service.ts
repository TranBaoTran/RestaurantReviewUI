import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Province } from '../../models/admin/province.model';

@Injectable({
  providedIn: 'root'
})
export class ProvinceService {
  private apiUrl = 'http://localhost:5043/Province'; // Địa chỉ API cho Province

  constructor(private http: HttpClient) {}

  // Lấy danh sách các tỉnh đang kích hoạt
  getProvinces(): Observable<Province[]> {
    return this.http.get<Province[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error fetching provinces:', error);
        return of([]); // Trả về danh sách rỗng nếu lỗi
      })
    );
  }

  // Lấy thông tin một tỉnh theo ID
  getProvinceById(provinceId: number): Observable<Province | null> {
    return this.http.get<Province>(`${this.apiUrl}/${provinceId}`).pipe(
      catchError(error => {
        if (error.status === 404) {
          console.warn('Province not found:', provinceId);
          return of(null); // Trả về null nếu không tìm thấy
        } else {
          console.error('Error fetching province:', error);
          throw error;
        }
      })
    );
  }

  // Tạo mới một tỉnh
  createProvince(province: Province): Observable<Province> {
    return this.http.post<Province>(this.apiUrl, province).pipe(
      catchError(error => {
        console.error('Error creating province:', error);
        throw error;
      })
    );
  }

  // Cập nhật thông tin một tỉnh
  updateProvince(provinceId: number, province: Province): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${provinceId}`, province).pipe(
      catchError(error => {
        console.error('Error updating province:', error);
        throw error;
      })
    );
  }

  // Xóa mềm một tỉnh
  deleteProvince(provinceId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${provinceId}`).pipe(
      catchError(error => {
        console.error('Error deleting province:', error);
        throw error;
      })
    );
  }

  // Kích hoạt lại một tỉnh
  activateProvince(provinceId: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/Activate/${provinceId}`, null).pipe(
      catchError(error => {
        console.error('Error activating province:', error);
        throw error;
      })
    );
  }

  // Tìm kiếm tỉnh
  searchProvinces(query: string): Observable<Province[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<Province[]>(`${this.apiUrl}/search`, { params });
  }
}
