import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators,ReactiveFormsModule} from '@angular/forms';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import { MdbValidationModule } from 'mdb-angular-ui-kit/validation';
import { RatingStarComponent } from "../rating-star/rating-star.component";
import { CommonModule } from '@angular/common';
import { RestaurantService } from '../../../services/restaurant.service';

@Component({
  selector: 'app-post-review',
  standalone: true,
  imports: [MdbValidationModule, ReactiveFormsModule, MdbFormsModule, RatingStarComponent, CommonModule],
  templateUrl: './post-review.component.html',
  styleUrl: './post-review.component.css'
})
export class PostReviewComponent {
  validationForm: FormGroup;
  imageUrl: string | ArrayBuffer | null | undefined = null;

  constructor(private restaurantService : RestaurantService) {
    this.validationForm = new FormGroup({
      firstName: new FormControl(null, { validators: Validators.required, updateOn: 'submit' }),
      lastName: new FormControl(null, { validators: Validators.required, updateOn: 'submit' }),
    });
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
}
