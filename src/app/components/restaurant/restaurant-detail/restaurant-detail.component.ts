import { Component, OnInit, Sanitizer } from '@angular/core';
import { MdbCarouselModule } from 'mdb-angular-ui-kit/carousel';
import { RestaurantReviewComponent } from "../restaurant-review/restaurant-review.component";
import { RestaurantService } from '../../../services/restaurant.service';
import { Image, Restaurant } from '../../../models/restaurant.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RatingStarComponent } from '../rating-star/rating-star.component';
import { CommonModule } from '@angular/common';
import { Category } from '../../../models/category.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { District, Province } from '../../../models/district.model';
@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [MdbCarouselModule, RestaurantReviewComponent,RatingStarComponent,RouterLink,CommonModule],
  templateUrl: './restaurant-detail.component.html',
  styleUrl: './restaurant-detail.component.css'
})
export class RestaurantDetailComponent implements OnInit{
  restaurant!: Restaurant;
  resProvin?: Province;
  resDistric? : District;
  resImage: Image[] = [];
  resCate: Category[] = [];
  Provinces: Province[] = [];
  Math = Math;
  sanitizedMapUrl!: SafeResourceUrl;
  
  constructor( private sanitizer: DomSanitizer,
    private restaurantService: RestaurantService, private route: ActivatedRoute){}


  ngOnInit(): void {
    this.loadRestaurant()
    this.loadResImages()
    this.loadProvince();
    window.scrollTo(0, 0);
    
  }


  loadRestaurant() {
    const id = this.route.snapshot.paramMap.get('id');

    if(!id) return;

    const resId = Number(id);

    this.restaurantService.getRestaurantById(resId).subscribe({
      next: (restaurant : Restaurant) => {
        this.restaurant = restaurant;
      }
    });
  }

  loadResImages() {
    const id = this.route.snapshot.paramMap.get('id');

    if(!id) return;

    const resId = Number(id);

    this.restaurantService.getImagesByRestaurantId(resId).subscribe({
      next: (image: Image[]) => {
        this.resImage = image
      },
      error: (error) => {
        console.error('Error fetching images:', error);
        window.alert('An error occurred while fetching restaurant images.');
        }
      });
  }

  loadResCate() {
      const id = this.route.snapshot.paramMap.get('id');

      if(!id) return;

      const resId = Number(id);

      // this.restaurantService.getCategories().subscribe({
      //   next: (image: Image[]) => {
      //     this.resImage = image
      //   },
      //   error: (error) => {
      //     console.error('Error fetching images:', error);
      //     window.alert('An error occurred while fetching restaurant images.');
      //     }
      //   });
  }

  loadProvince(){
      this.restaurantService.getProvinces().subscribe({
        next: (data : Province[]) => {
          this.Provinces = data;
        },
        error: (err) => {
          console.log("Cant fetch this Provices: " + err);         
        }
      })
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

    getGoogleMapURI(districName: string, provinceName: string) {
      const mapUrl = `https://www.google.com/maps/embed/v1/place?q=${encodeURIComponent(districName)}&key=AIzaSyAQaAR2rwH3sirB97zhco3jvf5R3xHyWiQ`;
      this.sanitizedMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
      return this.sanitizedMapUrl;
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

  getAverageRating(res : Restaurant): number {
    const ratings = res.averageRatings;
    const values = Object.values(ratings);
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    return sum / values.length;
  }



}

