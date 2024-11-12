import { Injectable, signal } from '@angular/core';
import { Review } from '../models/review.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  reviews = signal<Review[]>([]);

  private apiUrl = 'http://localhost:5043/';

  constructor(private http: HttpClient) { }

  getReviews() {
    return this.http.get<Review[]>(this.apiUrl + 'Review').subscribe({
      next: reviews => this.reviews.set(reviews)
    });
  }


}
