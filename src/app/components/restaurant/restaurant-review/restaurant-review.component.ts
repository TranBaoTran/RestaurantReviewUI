import { Component, inject, input, Input, OnInit, signal } from '@angular/core';
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
export class RestaurantReviewComponent implements OnInit {
  reviewService = inject(ReviewService);
  private route = inject(ActivatedRoute);
  restaurantReview = signal<Review[]>([]);
  
  ngOnInit(): void {
    this.loadReviews()
  }

  loadReviews() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    console.log(id);

    if(!id) return;
      this.reviewService.getReviews();
      this.restaurantReview.set(this.reviewService.reviews().filter(x => x.restaurantId === id))
      console.log((this.restaurantReview()));
      
  }
}
