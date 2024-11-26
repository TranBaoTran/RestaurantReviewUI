import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Review } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = "http://localhost:5043/Review";

  constructor(private http : HttpClient) { }

  getTop2Review(id : number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/Top2UpVoteReview/${id}`);
  } 

  getRestaurantReviews(id : number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/HighestUpVoteReview/${id}`);
  }

  getUserReviews(id : number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/GetUserReview/${id}`);
  }

  deleteReviewById(id : number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }

  upvoteReiview(revId : number, userId : number): Observable<{message : string}> {
    return this.http.post<{message : string}>(`${this.apiUrl}/UpVoteReviewButton/${revId}/${userId}`, null);
  }

  downvoteReiview(revId : number, userId : number): Observable<{message : string}> {
    return this.http.post<{message : string}>(`${this.apiUrl}/DownVoteReviewButton/${revId}/${userId}`, null);
  }

  addReview(userId : number, resId : number, formData : FormData): Observable<{message : string}> {
    return this.http.post<{message : string}>(`${this.apiUrl}/AddReviewAndImage/${userId}/${resId}`, formData);
  }
}
