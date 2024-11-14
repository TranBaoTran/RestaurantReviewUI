import { Component } from '@angular/core';
import { RestaurantListComponent } from "../restaurant/restaurant-list/restaurant-list.component";
import { RestaurantDetailComponent } from "../restaurant/restaurant-detail/restaurant-detail.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RestaurantDetailComponent, RestaurantListComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
