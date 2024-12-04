import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = 'http://localhost:5043/DashBoard'; // Thay bằng URL backend của bạn

  constructor(private http: HttpClient) {}

  // Lấy số lượng nhà hàng đang hoạt động
  getRestaurantCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/restaurantCount`);
  }

  // Lấy số lượng người dùng
  getUserCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/userCount`);
  }

  // Lấy số lượng nhà hàng theo quận
  getRestaurantsCountByDistrict(): Observable<any> {
    return this.http.get(`${this.baseUrl}/restaurantsCountByDistrict`);
  }
  
  getRestaurantReviewAndFavoriteCounts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/restaurantReviewAndFavoriteCounts`);
  }

  getAverageRatings(): Observable<any> {
    return this.http.get(`${this.baseUrl}/averageRatings`);
  }
}
