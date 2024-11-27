import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators,ReactiveFormsModule, FormBuilder} from '@angular/forms';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import { MdbValidationModule } from 'mdb-angular-ui-kit/validation';
import { RatingStarComponent } from "../rating-star/rating-star.component";
import { CommonModule } from '@angular/common';
import { RestaurantService } from '../../../services/restaurant.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Image, Restaurant } from '../../../models/restaurant.model';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { ReviewModelSent } from '../../../models/review.model';
import { ReviewService } from '../../../services/review.service';
import { SecureStorageService } from '../../../services/secure-storage.service';
import { UserService } from '../../../services/user.service';

const getBase64 = (file: File): Promise<string | ArrayBuffer | null> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });


@Component({
  selector: 'app-post-review',
  standalone: true,
  imports: [NzIconModule, NzModalModule, NzUploadModule, MdbValidationModule, ReactiveFormsModule, MdbFormsModule, RatingStarComponent, CommonModule],
  templateUrl: './post-review.component.html',
  styleUrl: './post-review.component.css'
})
export class PostReviewComponent implements OnInit {
  resImage: Image[] = [];
  restaurant !: Restaurant;
  validationForm : FormGroup;
  newReviewModelSent: ReviewModelSent = {
    revTitle: "",
    revContent: "",
    revLocation: 0,
    revPrice: 0,
    revQuality: 0,
    revService: 0,
    revSpace: 0,
    revImages: [],
  };
  isLoading = false; 
  // imageUrl: string | ArrayBuffer | null | undefined = null;

  constructor(private router : Router, private restaurantService : RestaurantService, private route : ActivatedRoute, private fb: FormBuilder, private reiviewService : ReviewService, private secureStorageService : SecureStorageService, private userService : UserService) {
    this.validationForm = this.fb.group({
      title: [this.newReviewModelSent.revTitle],
      content: [this.newReviewModelSent.revContent],
    });

    this.validationForm.valueChanges.subscribe(values => {
      this.newReviewModelSent.revTitle = values.title;
      this.newReviewModelSent.revContent = values.content;
    })
  }

  ngOnInit(): void {
    this.loadRestaurant();
    this.loadResImages();
  }

  onSubmit(): void {
    this.isLoading = true;
    this.validationForm.markAllAsTouched();
    const formData = new FormData();

    formData.append('revTitle', this.newReviewModelSent.revTitle);
    formData.append('revContent', this.newReviewModelSent.revContent);
    formData.append('revLocation', String(this.newReviewModelSent.revLocation));
    formData.append('revPrice', String(this.newReviewModelSent.revPrice)); 
    formData.append('revQuality', String(this.newReviewModelSent.revQuality)); 
    formData.append('revService', String(this.newReviewModelSent.revService)); 
    formData.append('revSpace', String(this.newReviewModelSent.revSpace));   

    this.fileList.forEach(file => {
      if (file.originFileObj) {
        formData.append('revImages', file.originFileObj); 
      }
    });

    if(this.userService.isLoggedIn()){
      const storedUserId = Number(this.secureStorageService.getUserId());
      this.reiviewService.addReview(storedUserId, this.restaurant.id, formData).subscribe({
        next : (data : {message : string}) => {
          if(data){
            this.isLoading = false;
            window.alert(data.message);
            this.router.navigate([`/restaurants/${this.restaurant.id}`]);
          }
        },
        error : (error) => {
          console.log("Error ; "+error);
        }
      })
    }
    
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

  onLocationRatingChange(newRating: number): void{
    this.newReviewModelSent.revLocation = newRating;
  }

  onPriceRatingChange(newRating: number): void{
    this.newReviewModelSent.revPrice = newRating;
  }

  onQualityRatingChange(newRating: number): void{
    this.newReviewModelSent.revQuality = newRating;
  }

  onServiceRatingChange(newRating: number): void{
    this.newReviewModelSent.revService = newRating;
  }

  onSpaceRatingChange(newRating: number): void{
    this.newReviewModelSent.revSpace = newRating;
  }


  // onFileSelected(event: Event): void {
  //   const fileInput = event.target as HTMLInputElement;
  //   if (fileInput.files && fileInput.files[0]) {
  //     const file = fileInput.files[0];
  //     const reader = new FileReader();
  //      // Kiểm tra loại file
  //   if (!file.type.startsWith('image/')) {
  //     alert('Chỉ được phép tải lên file ảnh');
  //     return;
  //   }
  //     reader.onload = (e) => {
  //       this.imageUrl = e.target?.result;
  //     };
      
  //     reader.readAsDataURL(file);
  //   }
  // }

  goToDetailRes(id : number): void{
    this.router.navigate([`/restaurants/${id}`])
  }

  fileList: NzUploadFile[] = [];
  previewImage: string | undefined = '';
  previewVisible = false;

  handlePreview = async (file: NzUploadFile): Promise<void> => {
    if (!file.url && !file['preview']) {
      file['preview'] = await getBase64(file.originFileObj!);
    }
    this.previewImage = file.url || file['preview'];
    this.previewVisible = true;
  };
}
