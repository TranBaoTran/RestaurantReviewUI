import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Province } from '../models/district.model';
import { Category } from '../models/category.model';
import { Restaurant } from '../models/restaurant.model';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {

  private apiUrl = 'http://localhost:5043/';

  constructor(private http: HttpClient) { }

  getProvinces(): Observable<Province[]> {
    return this.http.get<Province[]>(this.apiUrl + "ProvinceWithRestaurantCount");
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl + "Category");
  }
  
  restaurants = signal<Restaurant[]>([]);

  getRestaurant() {
    return this.http.get<Restaurant[]>(this.apiUrl + 'Restaurant').subscribe({
      next: restaurants => this.restaurants.set(restaurants) 
      
    });
  }

  getRestaurantById(Id: string) {
    // const restaurant = this.restaurants().find(x => x.id === Id);
    // if (restaurant !== undefined) return of(restaurant);

    return this.http.get<Restaurant>(this.apiUrl + 'Restaurant/' + Id);
  }
}
