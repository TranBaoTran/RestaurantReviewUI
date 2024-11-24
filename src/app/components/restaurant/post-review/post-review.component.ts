import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators,ReactiveFormsModule} from '@angular/forms';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import { MdbValidationModule } from 'mdb-angular-ui-kit/validation';
import { RatingStarComponent } from "../rating-star/rating-star.component";
import { CommonModule } from '@angular/common';
import { RestaurantService } from '../../../services/restaurant.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Image, Restaurant } from '../../../models/restaurant.model';

@Component({
  selector: 'app-post-review',
  standalone: true,
  imports: [MdbValidationModule, ReactiveFormsModule, MdbFormsModule, RatingStarComponent, CommonModule],
  templateUrl: './post-review.component.html',
  styleUrl: './post-review.component.css'
})
export class PostReviewComponent implements OnInit {
  resImage: Image[] = [];
  restaurant? : Restaurant;
  validationForm: FormGroup;
  imageUrl: string | ArrayBuffer | null | undefined = null;

  constructor(private router : Router, private restaurantService : RestaurantService, private route : ActivatedRoute) {
    this.validationForm = new FormGroup({
      firstName: new FormControl(null, { validators: Validators.required, updateOn: 'submit' }),
      lastName: new FormControl(null, { validators: Validators.required, updateOn: 'submit' }),
    });
  }
  ngOnInit(): void {
    this.loadRestaurant();
    this.loadResImages();
  }

  get firstName(): AbstractControl {
    return this.validationForm.get('firstName')!;
  }

  get lastName(): AbstractControl {
    return this.validationForm.get('lastName')!;
  }

  onSubmit(): void {
    this.validationForm.markAllAsTouched();
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


  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const reader = new FileReader();
       // Kiểm tra loại file
    if (!file.type.startsWith('image/')) {
      alert('Chỉ được phép tải lên file ảnh');
      return;
    }
      reader.onload = (e) => {
        this.imageUrl = e.target?.result;
      };
      
      reader.readAsDataURL(file);
    }
  }

  goToDetailRes(id : number): void{
    this.router.navigate([`/restaurants/${id}`])
  }
}
