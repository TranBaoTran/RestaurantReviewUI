import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Province } from '../models/district.model';
import { Category } from '../models/category.model';
import { Restaurant, Image, SentRestaurant } from '../models/restaurant.model';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {

  private apiUrl = 'http://localhost:5043/';

  constructor(private http: HttpClient) { }

  getProvinces(): Observable<Province[]> {
    return this.http.get<Province[]>(this.apiUrl + "ProvinceWithRestaurantCount");
  }

  getProvinceById(id : number): Observable<Province> {
    return this.http.get<Province>(`${this.apiUrl}ProvinceWithRestaurantCount/${id}`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl + "Category");
  }

  getAllRestaurant(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.apiUrl}Restaurant/GetNotDeletedRestaurant`);
  }


  getFamousRestaurantByProvince(id : number): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.apiUrl}RestaurantFilter/FamousRestaurant/${id}`);
  }

  getNewestRestaurantByProvince(id : number): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.apiUrl}RestaurantFilter/ProvincesNewestRestaurant/${id}`);
  }

  getImagesByRestaurantId(restaurantId: number): Observable<Image[]> {
    return this.http
      .get<{ image: Image[] }>(`${this.apiUrl}RestaurantFilter/RestaurantImg/${restaurantId}`)
      .pipe(map((response) => response.image));
  }

  getRestaurantById(id : number): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${this.apiUrl}Restaurant/${id}`);
  }

  filterRestaurants(query : string ,districtIds: number[], categoryIds: number[]): Observable<Restaurant[]> {
    const params = new URLSearchParams();
    params.append('query', query);
    districtIds.forEach(id => params.append('districtIds', id.toString()));
    categoryIds.forEach(id => params.append('categoryIds', id.toString()));

    return this.http.get<Restaurant[]>(`${this.apiUrl}RestaurantFilter/filter?${params.toString()}`);
  }

  getRestaurantCategoryByResId(id: number): Observable<Category[]>{
    return this.http.get<{category : Category[]}>(`${this.apiUrl}RestaurantFilter/RestaurantCategory/${id}`).pipe(map((res) => res.category));
  }

  getUserRestaurant(id : number): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.apiUrl}Restaurant/GetUserRestaurant/${id}`);
  }

  addRestaurantImg(resId : number, formData : FormData): Observable<Image[]>{
    return this.http.post<Image[]>(`${this.apiUrl}Restaurant/UploadResImage/${resId}`, formData);
  }

  delRestaurantImg(resId : number, publicId : string): Observable<{message : string}>{
    return this.http.put<{message : string}>(`${this.apiUrl}Restaurant/DeleteRestaurantImage/${resId}/${publicId}`, null);
  }

  updateRestaurant(resId : number, sentRes : SentRestaurant): Observable<{message : string}>{
    return this.http.put<{message : string}>(`${this.apiUrl}Restaurant/UptadeRestaurant/${resId}`, sentRes);
  }

  deleteRestaurant(resId : number): Observable<{message : string}>{
    return this.http.post<{message : string}>(`${this.apiUrl}Restaurant/DeleteRestaurant/${resId}`, null);
  }

  createRestaurant(userId: number, formData : FormData): Observable<{message : string}>{
    return this.http.post<{message : string}>(`${this.apiUrl}Restaurant/CreateRestaurant/${userId}`, formData);
  }

  requestAcceptRestaurant(resId : number, sentRes : SentRestaurant): Observable<{message : string}>{
    return this.http.put<{message : string}>(`${this.apiUrl}Restaurant/RequestAcceptRestaurant/${resId}`, sentRes);
  }

  acceptRestaurant(resId : number): Observable<{message : string}>{
    return this.http.post<{message : string}>(`${this.apiUrl}Restaurant/AcceptRestaurant/${resId}`, null);
  }

  rejectRestaurant(resId : number): Observable<{message : string}>{
    return this.http.post<{message : string}>(`${this.apiUrl}Restaurant/RejectRestaurant/${resId}`, null);
  }
}
