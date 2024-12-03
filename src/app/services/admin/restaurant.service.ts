import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { Restaurant } from '../../models/admin/restaurant.model';
import { District } from '../../models/admin/district.model';


@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
    private apiUrlRestaurant = 'http://localhost:5043/Restaurant';

    constructor(private http: HttpClient) { }

    // Restaurant
    getRestaurants(): Observable<any> {
        return this.http.get<any>(`${this.apiUrlRestaurant}/admin`);
    }

    getWaitingRestaurants(): Observable<any> {
        return this.http.get<any>(`${this.apiUrlRestaurant}/admin/waiting`);
    }

    getRestaurantById(restaurantId: number): Observable<Restaurant | null> {
        return this.http.get<Restaurant>(`${this.apiUrlRestaurant}/${restaurantId}`).pipe(
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

    // Xóa nhà hàng
    lockRestaurant(restaurantId: number): Observable<any> {
        return this.http.put<any>(`${this.apiUrlRestaurant}/lock/${restaurantId}`, null).pipe(
            catchError(error => {
            // Xử lý lỗi nếu có
            if (error.status === 404) {
                console.error('Restaurant not found');
            } else if (error.status === 400) {
                console.error('Restaurant is already locked');
            }
            return of(null); // Trả về null nếu có lỗi
            })
        );
    }

    acceptRestaurant(id: number) {
        return this.http.put(`${this.apiUrlRestaurant}/${id}/accept`, {});        
    }

    rejectRestaurant(id: number) {
        return this.http.put(`${this.apiUrlRestaurant}/${id}/reject`, {});        
    }

    deleteRestaurant(id: number) {
        return this.http.post(`${this.apiUrlRestaurant}/DeleteRestaurant/${id}`, {});        
    }

    // Phương thức tìm kiếm nhà hàng
    searchRestaurantsCombined(searchTerm: string, categoryIds: number[]): Observable<any[]> {
        let params = new HttpParams();
      
        if (searchTerm) {
          params = params.set('searchTerm', searchTerm);
        }
      
        if (categoryIds && categoryIds.length > 0) {
          categoryIds.forEach((id) => {
            params = params.append('categoryIds', id.toString());
          });
        }

        return this.http.get<any[]>(`${this.apiUrlRestaurant}/searchCombined`, { params });
      }      
    
    searchRestaurants(query: string): Observable<Restaurant[]> {
        const params = new HttpParams().set('query', query);
        return this.http.get<Restaurant[]>(`${this.apiUrlRestaurant}/search`, { params });
    }

}