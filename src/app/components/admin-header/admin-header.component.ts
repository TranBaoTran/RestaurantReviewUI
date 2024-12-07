var google : any;

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SecureStorageService } from '../../services/secure-storage.service';
import { RestaurantService } from '../../services/restaurant.service';
import { Restaurant } from '../../models/restaurant.model';

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


  constructor(private restaurantService: RestaurantService, private router: Router, 
      private secureStorageService: SecureStorageService) { }

  ngOnInit(): void {
    this.getWaitingRestaurants();
  }

  getWaitingRestaurants(): void {
    this.restaurantService.getAllRestaurant().subscribe({
        next : (data: Restaurant[]) => {  // Khai báo kiểu cho data trả về từ API
          this.waitingRestaurants = data.filter((restaurant: Restaurant) => restaurant.status === 'waiting');
          this.waitingRestaurantsCount = this.waitingRestaurants.length;  
        },
        error : (error) => {
          console.error('Lỗi khi lấy dữ liệu nhà hàng:', error);
        }
    });
  }

  navigateToRestaurantManagement() {
    this.router.navigate(['/admin/restaurant-management']);
  }

  logOut(): void {
    if (google && google.accounts && google.accounts.id) {
      google.accounts.id.disableAutoSelect();
    }
    this.secureStorageService.clearStorage();
    this.router.navigate(['/']);
  }
}
