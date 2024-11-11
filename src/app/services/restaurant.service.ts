import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Province } from '../models/district.model';
import { Category } from '../models/category.model';

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
}
