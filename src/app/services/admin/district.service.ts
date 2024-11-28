import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { District } from '../../models/admin/district.model';


@Injectable({
  providedIn: 'root'
})
export class DistrictService {
    private apiUrlDistrict = 'http://localhost:5043/District';

    constructor(private http: HttpClient) { }

    getDistricts(): Observable<any> {
        return this.http.get<any>(this.apiUrlDistrict);
      }
    
  getDistrictById(districtId: number): Observable<District | null> {
    return this.http.get<District>(`${this.apiUrlDistrict}/${districtId}`).pipe(
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

  getDistrictNameById(districtId: number): Observable<string | null> {
    return this.getDistrictById(districtId).pipe(
      catchError(error => {
        console.error('Error fetching district by ID', error);
        return of(null); // Return null if there's an error
      }),
      map(district => district ? district.name : null) // Map to the name if found, or null if not
    );
  }

  // Khóa tài khoản người dùng
  lockDistrict(districtId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrlDistrict}/lock/${districtId}`, null).pipe(
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

  searchDistricts(searchTerm: string): Observable<District[]> {
    return this.http.get<District[]>(`${this.apiUrlDistrict}/search?searchTerm=${searchTerm}`);
  }
}