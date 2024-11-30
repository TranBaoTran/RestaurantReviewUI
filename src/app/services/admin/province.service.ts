import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { Province } from '../../models/admin/province.model';


@Injectable({
  providedIn: 'root'
})
export class ProvinceService {
    private apiUrl = 'http://localhost:5043/Province';

    constructor(private http: HttpClient) { }

    getProvinces(): Observable<any> {
        return this.http.get<any>(this.apiUrl);
      }
    
  getProvinceById(provinceId: number): Observable<Province | null> {
    return this.http.get<Province>(`${this.apiUrl}/${provinceId}`).pipe(
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
  lockProvince(provinceId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/lock/${provinceId}`, null).pipe(
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

  searchProvinces(searchTerm: string): Observable<Province[]> {
    return this.http.get<Province[]>(`${this.apiUrl}/search?searchTerm=${searchTerm}`);
  }
}