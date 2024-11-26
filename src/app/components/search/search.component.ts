var google : any;
import { Component } from '@angular/core';
import { Restaurant } from '../../models/restaurant.model';
import { RestaurantService } from '../../services/restaurant.service';
import { SearchService } from '../../services/search.service';
import { CommonModule } from '@angular/common';
import { Province } from '../../models/district.model';
import { UserService } from '../../services/user.service';
import { SecureStorageService } from '../../services/secure-storage.service';
import { forkJoin, map } from 'rxjs';
import { Router } from '@angular/router';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {
  provinces : Province[] = [];
  restaurants: Restaurant[] = [];
  favoriteIds: number[] = [];
  Math = Math;
  isUserLoggedIn : boolean = false

  constructor(private searchService: SearchService, private restaurantService: RestaurantService, private userService : UserService, private secureStorageService : SecureStorageService, private router : Router, private reviewService : ReviewService) {}

  ngOnInit() {
    this.getSearchRes();
    this.getProvinces();
    this.isUserLoggedIn = this.userService.isLoggedIn();
    if(this.secureStorageService.getUserId()){
      this.getFavoriteIds(Number(this.secureStorageService.getUserId()));
    }
  }

  getSearchRes(): void{
    this.searchService.searchCriteria$.subscribe(criteria => {
      this.restaurantService.filterRestaurants(criteria.query, criteria.districtIds, criteria.categoryIds).subscribe({
        next : (restaurants : Restaurant[]) => {
          const updatedRestaurants = restaurants.map((restaurant) => ({
            ...restaurant,
            isFavorite: this.favoriteIds.includes(restaurant.id),
          }));

          const fetchReviews = updatedRestaurants.map((restaurant) =>
            this.reviewService.getTop2Review(restaurant.id).pipe(
              map((review) => {
                restaurant.reviews = review;
                return restaurant;
              })
            )
          );

          forkJoin(fetchReviews).subscribe({
            next: (updatedRestaurants) => {
              this.restaurants = updatedRestaurants;
            },
            error: (error) => {
              console.error('Error fetching reviews:', error);
              window.alert('An error occurred while fetching restaurant reviews.');
            }
          });

        },
        error : (error) => {
          console.error('Error searching restaurants', error)
        }
      });
    });
  }

  getProvinces(){
    this.restaurantService.getProvinces().subscribe({
      next: (data : Province[]) => {
        if(data){
          this.provinces = data;
        }
      },
      error: (error) => {
        console.error('Error fetching provinces:', error);
        window.alert('An error occurred while fetching the provinces.');
      },complete: () => {
        console.log('getProvinces request completed.');
      },
    })
  } 

  getAverageRating(res : Restaurant): number {
    const ratings = res.averageRatings;
    const values = Object.values(ratings);
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    return sum / values.length;
  }

  isCurrentTimeBetween(startTime: string, endTime: string): boolean {
    const currentDate = new Date();
    
    const currentTimeInSeconds = currentDate.getHours() * 3600 + currentDate.getMinutes() * 60 + currentDate.getSeconds();
  
    const [startHours, startMinutes, startSeconds] = startTime.split(':').map(Number);
    const startTimeInSeconds = startHours * 3600 + startMinutes * 60 + startSeconds;
  
    const [endHours, endMinutes, endSeconds] = endTime.split(':').map(Number);
    const endTimeInSeconds = endHours * 3600 + endMinutes * 60 + endSeconds;
  
    if (startTimeInSeconds < endTimeInSeconds) {
      return currentTimeInSeconds >= startTimeInSeconds && currentTimeInSeconds <= endTimeInSeconds;
    } else {
      return currentTimeInSeconds >= startTimeInSeconds || currentTimeInSeconds <= endTimeInSeconds;
    }
  }
  
  getDistrictAndProvinceName(districtID: number, provinces: Province[]): { districtName: string; provinceName: string } | null {
    for (const province of provinces) {
      const district = province.districts.find(d => d.id === districtID);
      if (district) {
        return {
          districtName: district.name,
          provinceName: province.name
        };
      }
    }
    return null;
  }

  getFavoriteIds(id : number): void {
    this.userService.getFavoriteRestaurantIds(id).subscribe({
      next: (response: { resId: { id: number }[] }) => {
        this.favoriteIds = response.resId.map((item) => item.id);
      },
      error: (error) => {
        console.error('Error fetching favorite restaurant IDs:', error);
        window.alert('An error occurred while fetching favorite restaurant IDs.');
      },
    });
  }

  changeFav(isFave : boolean, resid : number): void{
    if(this.userService.isLoggedIn()){
      if(isFave){
        this.userService.removeFavRestaurant(Number(this.secureStorageService.getUserId()), resid).subscribe({
          next : (mess : {message : string}) => {
            if(mess){
              window.alert(mess.message);
            }
            this.getFavoriteIds(Number(this.secureStorageService.getUserId()));
            this.getSearchRes();
          }, 
          error: (error) => {
            if (error.status === 401) {
              window.alert("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại!");
              this.secureStorageService.clearStorage();
              google.accounts.id.disableAutoSelect();
              this.router.navigate(['/login']);
            } else {
              window.alert(`An error occurred: ${error.message}`);
            }
          },
          complete: () => {
            console.log("Remove fav successful");
          }
        })
      }else{
        this.userService.addFavRestaurant(Number(this.secureStorageService.getUserId()), resid).subscribe({
          next : (mess : {message : string}) => {
            if(mess){
              window.alert(mess.message);
            }
            this.getFavoriteIds(Number(this.secureStorageService.getUserId()));
            this.getSearchRes();
          }, 
          error: (error) => {
            if (error.status === 401) {
              window.alert("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại!");
              this.secureStorageService.clearStorage();
              google.accounts.id.disableAutoSelect();
              this.router.navigate(['/login']);
            } else {
              window.alert(`An error occurred: ${error.message}`);
            }
          },
          complete: () => {
            console.log("Add fav successful");
          }
        })
      }
    }else{
      this.router.navigate(['/login']);
    }
  }

  searchByCate(id : number): void{
    this.searchService.updateSearchCriteria({
      query: '',
      districtIds : [],
      categoryIds : [id]
    });
  }

  goToDetailRes(id : number): void{
    this.router.navigate([`/restaurants/${id}`])
  }
}
