import { Component, OnDestroy, OnInit } from '@angular/core';

import {
  FormsModule,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Subject } from 'rxjs';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';

import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule} from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { RestaurantService } from '../../../services/restaurant.service';
import { District, Province } from '../../../models/district.model';
import { Category } from '../../../models/category.model';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Restaurant} from '../../../models/restaurant.model';
import { Image } from '../../../models/restaurant.model';

const getBase64 = (file: File): Promise<string | ArrayBuffer | null> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

@Component({
  selector: 'app-add-restaurant',
  standalone: true,
  imports: [ NzModalModule, NzUploadModule, FormsModule, 
    NzTimePickerModule, ReactiveFormsModule, NzButtonModule, 
    NzCheckboxModule, NzFormModule, NzInputModule, NzSelectModule],
  templateUrl: './edit-restaurant.component.html',
  styleUrl: './edit-restaurant.component.css'
})

export class EditRestaurantComponent implements OnDestroy,OnInit {
  restaurant !: Restaurant;
  resImage: Image[] = [];

  private destroy$ = new Subject<void>();
  validateForm: FormGroup;

  provinces: Province[] = [];
  categories: Category[] = [];
  currentDistrict: District[] = [];
  restaurantCategory: Category[] = [];

  //select box
  selectedProvinceId : number | null = 0;
  selectedCategories : number[] = [] ;

  //time
  currentOpenTime : Date | null = null ;
  currentCloseTime : Date | null = null;

  //Upload Image
  fileList: NzUploadFile[] = [];
  previewImage: string | undefined = '';
  previewVisible = false;

  constructor(private router:Router, private route : ActivatedRoute, private fb:NonNullableFormBuilder, private restaurantService:RestaurantService){
    this.validateForm = this.fb.group({
      name: this.fb.control('', [Validators.required]),
      address: this.fb.control('', [Validators.required]),
      lowPrice: this.fb.control('', [Validators.required]),
      highPrice: this.fb.control('', [Validators.required]),
      province: this.fb.control('', [Validators.required]),
      district: this.fb.control('', [Validators.required]),
      category: this.fb.control('',[Validators.required]),
      openTime: this.fb.control<Date | null>(null),
      closeTime: this.fb.control<Date | null>(null),
      phoneNumber: this.fb.control('', [Validators.required]),
      website: this.fb.control('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.loadProvince();
    this.loadRestaurant();
    this.loadCategory();
    this.loadResCate() ;
    this.loadResImages();

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      alert(this.selectedCategories)
      console.log('submit', this.validateForm.value);
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  loadCategory() {
    this.restaurantService.getCategories().subscribe({
      next: (data: Category[]) => {
        this.categories = data;
     
      },
      error: (err) => {
        console.log("Cant fetch this Categories: " + err);         
      }
    })
}

loadResCate() {
  const id = this.route.snapshot.paramMap.get('id');

  if(!id) return;

  const resId = Number(id);

  this.restaurantService.getRestaurantCategoryByResId(resId).subscribe({
    next: (data : Category[]) => {
      this.restaurantCategory = data;
      this.selectedCategories = this.restaurantCategory.map(item => item.id)
    },
    error: (error) => {
      console.error('Error fetching Restaurant Category:', error);
      window.alert('An error occurred while fetching Restaurant Category.');
      }
    });
}


  loadProvince(){
  this.restaurantService.getProvinces().subscribe({
      next: (data : Province[]) => {
        this.provinces = data;
        this.selectedProvinceId = this.getDistrictAndProvinceName(this.restaurant.districtId,this.provinces);
      },
      error: (err) => {
        console.log("Cant fetch this Provices: " + err);         
      }
    })
  }

  getDistrict(id : number ){
    const province = this.provinces.find(p => p.id === id);
    this.currentDistrict = province ? province.districts : [];
  }
  
  getDistrictAndProvinceName(districtID: number, provinces: Province[]): number | null {
    for (const province of provinces) {
      const district = province.districts.find(d => d.id === districtID);
      if (district) {
        return province.id
      }
    }
    return null;
}


  loadResImages() {
    const id = this.route.snapshot.paramMap.get('id');

    if(!id) return;

    const resId = Number(id);

    this.restaurantService.getImagesByRestaurantId(resId).subscribe({
      next: (image: Image[]) => {
        this.resImage = image
        this.fileList = this.convertImagesToNzUploadFiles(this.resImage);
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
        this.currentOpenTime = this.convertStringToDate(this.restaurant.openedTime);
        this.currentCloseTime = this.convertStringToDate(this.restaurant.closedTime);
        // this.currentDistrict = this.restaurant.districtId
      }
    });
  }


  handlePreview = async (file: NzUploadFile): Promise<void> => {
    if (!file.url && !file['preview']) {
      file['preview'] = await getBase64(file.originFileObj!);
    }
    this.previewImage = file.url || file['preview'];
    this.previewVisible = true;
  };

  convertImagesToNzUploadFiles(images: Image[]): NzUploadFile[] {
    return images.map((image) => ({
      uid: image.publicId, // Sử dụng `publicId` làm `uid`
      name: image.imgPath.split('/').pop() || 'unknown', // Tên file lấy từ `imgPath`
      url: image.imgPath, // URL là đường dẫn gốc
    }));
  }
  
   convertStringToDate(timeString: string): Date | null {
    if (!timeString) return null;
  
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
  
    // Tạo đối tượng Date mới với giờ, phút, giây
    const now = new Date();
    now.setHours(hours, minutes, seconds || 0, 0);
  
    return now;
  }

  goToDetailRes(id : number): void{
    this.router.navigate([`/restaurants/${id}`])
  }
}

