import { Component, input } from '@angular/core';
import { Restaurant } from '../../../models/restaurant.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-restaurant-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './restaurant-card.component.html',
  styleUrl: './restaurant-card.component.css'
})
export class RestaurantCardComponent {
  restaurant = input.required<Restaurant>()
}
