import { Component, inject, OnInit } from '@angular/core';
import { MdbCarouselModule } from 'mdb-angular-ui-kit/carousel';
import { RestaurantReviewComponent } from "../restaurant-review/restaurant-review.component";
import { RestaurantService } from '../../../services/restaurant.service';
import { Restaurant } from '../../../models/restaurant.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RatingStarComponent } from '../rating-star/rating-star.component';

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [MdbCarouselModule, RestaurantReviewComponent,RatingStarComponent,RouterLink],
  templateUrl: './restaurant-detail.component.html',
  styleUrl: './restaurant-detail.component.css'
})
export class RestaurantDetailComponent implements OnInit{
  private restaurantService = inject(RestaurantService);
  private route = inject(ActivatedRoute);
  restaurant?: Restaurant

  ngOnInit(): void {
    this.loadRestaurant()
  }

  loadRestaurant() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log(id);

    if(!id) return;

    this.restaurantService.getRestaurantById(id).subscribe({
      next: restaurant => {
        this.restaurant = restaurant
      }
    });
  }
}
