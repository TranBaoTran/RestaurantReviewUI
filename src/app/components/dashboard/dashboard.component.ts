var google : any;
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MdbTabsModule } from 'mdb-angular-ui-kit/tabs';
import { Restaurant } from '../../models/restaurant.model';
import { RestaurantService } from '../../services/restaurant.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { forkJoin, map } from 'rxjs';
import { SecureStorageService } from '../../services/secure-storage.service';
import { Province } from '../../models/district.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MdbTabsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  provinceId : number = 2;
  famousRes : Restaurant[] = []
  newestRes : Restaurant[] = []
  likedRes : Restaurant[] = []
  revRes : Restaurant[] = []
  isUserLoggedIn : boolean = false
  favoriteIds : number[] = [];
  province : Province[] = [];

  constructor(private activedRoute : ActivatedRoute, private restaurantService : RestaurantService, private userService : UserService, private secureStorageService : SecureStorageService, private router : Router) {}

  ngOnInit(): void {
    this.isUserLoggedIn = this.userService.isLoggedIn();
    if(this.secureStorageService.getUserId()){
      this.getFavoriteIds(Number(this.secureStorageService.getUserId()));
      this.getReviewdRes(Number(this.secureStorageService.getUserId()));
    }

    this.activedRoute.paramMap.subscribe(params => {
      const proID = params.get('query');
      if(proID){
        this.provinceId = Number(proID);
      }
      
      this.getFamousRes();
      this.getNewestRes(); 
    });

    this.restaurantService.getProvinces().subscribe({
      next : (data : Province[]) => {
        this.province = data;
        console.log(this.province);
      },
      error : (error) => {
        console.log("Error fetching province by id:" + error);
      }
    });
    
    
  }

  getFavoriteIds(id : number): void {
    this.userService.getFavoriteRestaurantIds(id).subscribe({
      next: (response: { resId: { id: number }[] }) => {
        this.favoriteIds = response.resId.map((item) => item.id);
        this.getFavoriteRes();
      },
      error: (error) => {
        console.error('Error fetching favorite restaurant IDs:', error);
        window.alert('An error occurred while fetching favorite restaurant IDs.');
      },
    });
  }

  getFavoriteRes(): void {
    const restaurantRequests = this.favoriteIds.map(id => {
      const restaurant = this.restaurantService.getRestaurantById(id);
      const images = this.restaurantService.getImagesByRestaurantId(id);
      
      return forkJoin([restaurant, images]).pipe(
        map(([restaurant, images]) => {
          return { ...restaurant, image: images, isFavorite: this.favoriteIds.includes(restaurant.id) };
        })
      );
    });
  
    forkJoin(restaurantRequests).subscribe({
      next: (restaurants: any[]) => {
        this.likedRes = restaurants;
      },
      error: (error) => {
        console.error('Error fetching favorite restaurants and images:', error);
        window.alert('An error occurred while fetching the favorite restaurants and images.');
      }
    });
  }

  getReviewdRes(id : number): void {
    this.userService.getReviewdRestaurantIds(id).subscribe({
      next: (response: { resId: { id: number }[] }) => {
        const revID = response.resId.map((item) => item.id);

        const restaurantRequests = revID.map(id => {
          const restaurant = this.restaurantService.getRestaurantById(id);
          const images = this.restaurantService.getImagesByRestaurantId(id);
          
          return forkJoin([restaurant, images]).pipe(
            map(([restaurant, images]) => {
              return { ...restaurant, image: images, isFavorite: this.favoriteIds.includes(restaurant.id) };
            })
          );
        });
      
        forkJoin(restaurantRequests).subscribe({
          next: (restaurants: any[]) => {
            this.revRes = restaurants;
          },
          error: (error) => {
            console.error('Error fetching reviewed restaurants and images:', error);
            window.alert('An error occurred while fetching the reviewed restaurants and images.');
          }
        });

      },
      error: (error) => {
        console.error('Error fetching reviewed restaurant IDs:', error);
        window.alert('An error occurred while fetching reviewed restaurant IDs.');
      },
    });
  }

  getFamousRes(): void {
    this.restaurantService.getFamousRestaurantByProvince(this.provinceId).subscribe({
      next: (restaurants: Restaurant[]) => {
        if (restaurants && restaurants.length > 0) {
          const updatedRestaurants = restaurants.map((restaurant) => ({
            ...restaurant,
            isFavorite: this.favoriteIds.includes(restaurant.id),
          }));
          
          const fetchImages = updatedRestaurants.map((restaurant) =>
            this.restaurantService.getImagesByRestaurantId(restaurant.id).pipe(
              map((images) => {
                restaurant.image = images;
                return restaurant;
              })
            )
          );
  
          forkJoin(fetchImages).subscribe({
            next: (updatedRestaurants) => {
              this.famousRes = updatedRestaurants;
            },
            error: (error) => {
              console.error('Error fetching images:', error);
              window.alert('An error occurred while fetching restaurant images.');
            }
          });
        } else {
          console.warn('No restaurants found for the specified province.');
          this.famousRes = [];
        }
      },
      error: (error) => {
        console.error('Error fetching restaurants:', error);
        window.alert('An error occurred while fetching the restaurant.');
      },
      complete: () => {
        console.log('getFamousRestaurantByProvince request completed.');
      },
    });
  }
  
  
  getNewestRes(): void{
    this.restaurantService.getNewestRestaurantByProvince(this.provinceId).subscribe({
      next: (restaurants: Restaurant[]) => {
        if (restaurants && restaurants.length > 0) {
          const updatedRestaurants = restaurants.map((restaurant) => ({
            ...restaurant,
            isFavorite: this.favoriteIds.includes(restaurant.id)  
          }));
          
          const fetchImages = updatedRestaurants.map((restaurant) =>
            this.restaurantService.getImagesByRestaurantId(restaurant.id).pipe(
              map((images) => {
                restaurant.image = images;
                return restaurant;
              })
            )
          );
  
          forkJoin(fetchImages).subscribe({
            next: (updatedRestaurants) => {
              this.newestRes = updatedRestaurants;
            },
            error: (error) => {
              console.error('Error fetching images:', error);
              window.alert('An error occurred while fetching restaurant images.');
            }
          });
        } else {
          console.warn('No restaurants found for the specified province.');
          this.newestRes = [];
        }
      },
      error: (error) => {
        console.error('Error fetching restaurant:', error);
        window.alert('An error occurred while fetching the restaurant.');
      },
      complete: () => {
        console.log('getNewestRestaurantByProvince request completed.');
      },
    })
  }

  getAverageRating(res : Restaurant): number {
    const ratings = res.averageRatings;
    const values = Object.values(ratings);
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    return sum / values.length;
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
            this.getFamousRes();
            this.getNewestRes();
            this.getFavoriteRes();
            this.getReviewdRes(Number(this.secureStorageService.getUserId()));
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
            this.getFamousRes();
            this.getNewestRes();
            this.getFavoriteRes();
            this.getReviewdRes(Number(this.secureStorageService.getUserId()));
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

  goToDetailRes(id : number): void{
    this.router.navigate([`/restaurants/${id}`])
  }
}
