import { HttpClient } from '@angular/common/http';
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
    return this.http.get<any>(this.apiUrlRestaurant);
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

    // Phương thức tìm kiếm nhà hàng
    searchRestaurants(searchTerm: string): Observable<Restaurant[]> {
        return this.http.get<Restaurant[]>(`${this.apiUrlRestaurant}/search?searchTerm=${searchTerm}`);
    }


    private apiUrlDistrict = 'http://localhost:5043/District';
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
}