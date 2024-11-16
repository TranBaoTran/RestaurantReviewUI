import { Component, inject, signal } from '@angular/core';
import { ReviewService } from '../../../services/review.service';
import { Review } from '../../../models/review.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-restaurant-review',
  standalone: true,
  imports: [],
  templateUrl: './restaurant-review.component.html',
  styleUrl: './restaurant-review.component.css'
})
export class RestaurantReviewComponent {
  restaurantReview : Review[] = []
  
  constructor(private reviewService : ReviewService, private activatedRoute : ActivatedRoute) {
    this.loadReviews()
  }

  loadReviews() {
    const id = Number(this.activatedRoute.snapshot.paramMap.get('id'));
    console.log(id);
    

    if(!id) return;
    this.reviewService.getRestaurantReviews(id).subscribe({
      next: (data : Review[]) => {
        this.restaurantReview = data
      },
      error: (error) => {
        console.log("Can't fetch Review:" + error);
      }
    })
  }
}
