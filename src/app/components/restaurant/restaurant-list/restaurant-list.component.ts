import { Component, inject, OnInit } from '@angular/core';
import { RestaurantService } from '../../../services/restaurant.service';
import { RestaurantCardComponent } from '../restaurant-card/restaurant-card.component';

@Component({
  selector: 'app-restaurant-list',
  standalone: true,
  imports: [RestaurantCardComponent],
  templateUrl: './restaurant-list.component.html',
  styleUrl: './restaurant-list.component.css'
})
export class RestaurantListComponent  implements OnInit {
  restaurantService = inject(RestaurantService)

  ngOnInit(): void {
    if(this.restaurantService.restaurants().length === 0) this.loadRestaurant();
    console.log(this.restaurantService.restaurants());
    
  }

  loadRestaurant() {
    this.restaurantService.getRestaurant();
  }

}
