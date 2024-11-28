import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Restaurant } from '../../models/admin/restaurant.model';
import { Router, RouterModule } from '@angular/router';
import { RestaurantService } from '../../services/admin/restaurant.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.css'
})
export class AdminHeaderComponent implements OnInit {
  waitingRestaurants: any[] = [];
  waitingRestaurantsCount: number = 0;


  constructor(private restaurantService: RestaurantService, private router: Router) { }

  ngOnInit(): void {
    // this.getWaitingRestaurants();

    this.waitingRestaurants = [
      { id: 1, userId: 101, name: 'Restaurant A', category: 'Italian', district: 'District 1' },
      { id: 2, userId: 102, name: 'Restaurant B', category: 'Chinese', district: 'District 2' },
      { id: 3, userId: 103, name: 'Restaurant C', category: 'Indian', district: 'District 3' },
      { id: 4, userId: 104, name: 'Restaurant D', category: 'Thai', district: 'District 4' },
    ];
    
    this.waitingRestaurantsCount = this.waitingRestaurants.length;

    this.waitingRestaurantsCount = this.waitingRestaurants.length;

  }

  getWaitingRestaurants(): void {
    this.restaurantService.getRestaurants().subscribe(
      (data: Restaurant[]) => {  // Khai báo kiểu cho data trả về từ API
        this.waitingRestaurants = data.filter((restaurant: Restaurant) => restaurant.status === 'waiting');
        this.waitingRestaurantsCount = this.waitingRestaurants.length;  
      },
      (error) => {
        console.error('Lỗi khi lấy dữ liệu nhà hàng:', error);
      }
    );
  }

  navigateToRestaurantManagement() {
    this.router.navigate(['/admin/restaurant-management']);
  }
}
