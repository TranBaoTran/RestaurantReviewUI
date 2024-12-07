var google : any;

import { Component, OnDestroy, OnInit } from '@angular/core';

import {
  FormsModule,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
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
import { CommonModule } from '@angular/common';
import { SecureStorageService } from '../../../services/secure-storage.service';
import { Router } from '@angular/router';
import { Restaurant } from '../../../models/restaurant.model';

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
    NzCheckboxModule, NzFormModule, NzInputModule, NzSelectModule, CommonModule],
  templateUrl: './add-restaurant.component.html',
  styleUrl: './add-restaurant.component.css'
})
export class AddRestaurantComponent implements OnDestroy,OnInit {
  private destroy$ = new Subject<void>();
  validateForm: FormGroup;

  provinces: Province[] = [];
  categories: Category[] = [];
  currentDistrict: District[] = [];

  //select box
  selectedProvinceId? : number;
  SelectedCategories = [];
  
  //Upload Image
  fileList: NzUploadFile[] = [];
  previewImage: string | undefined = '';
  previewVisible = false;
  isLoading = false;

  constructor(private fb:NonNullableFormBuilder, private restaurantService:RestaurantService, private secureStorageService : SecureStorageService, private router : Router){
    this.validateForm = this.fb.group({
      name: this.fb.control('', [Validators.required]),
      address: this.fb.control('', [Validators.required]),
      lowPrice: this.fb.control('0', [Validators.required, Validators.pattern('^[0-9]+$')]),
      highPrice: this.fb.control('1', [Validators.required, Validators.pattern('^[0-9]+$')]),
      province: this.fb.control('', [Validators.required]),
      district: this.fb.control('', [Validators.required]),
      category: this.fb.control('',[Validators.required]),
      openTime: this.fb.control<Date | null>(null),
      closeTime: this.fb.control<Date | null>(null),
      phoneNumber: this.fb.control('', [Validators.required, Validators.pattern("^([0-9]{10})$|^([0-9]{3}-[0-9]{3}-[0-9]{4})$|^(\\+?[0-9]{1,4}[\\s]?\\(?[0-9]{3}\\)?[\\s]?[0-9]{3}[-\\s]?[0-9]{4})$")]),
      website: this.fb.control('', [Validators.pattern(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)]),
    },
      { validators: combinedValidator() });
  }

  formatDateToString(date: Date | null): string {
    if (!date) return '';
    const localDate = new Date(date);
    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
    return localDate.toISOString().split('T')[1].substring(0, 5); // Extract time part: HH:mm
  }

  onTimeChange(): void {
    this.validateForm.get('openTime')?.updateValueAndValidity();
    this.validateForm.get('closeTime')?.updateValueAndValidity();
  }

  ngOnInit(): void {
    this.restaurantService.getUserRestaurant(Number(this.secureStorageService.getUserId())).subscribe({
      next : (data : Restaurant[]) => {
        if(data.length > 0){
          this.router.navigate(['/edit-restaurant']);
        }
      }, 
      error : (error) => {
        if (error.status === 401) {
          window.alert("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại!");
          this.secureStorageService.clearStorage();
          google.accounts.id.disableAutoSelect();
          this.router.navigate(['/login']);
        } else {
          console.error('Error fetching user restaurant:', error);
          window.alert('An error occurred while fetching user restaurant.');
        }   
      }
    })
    this.loadProvince()
    this.loadCategory()
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submitForm(): void {
    if (this.fileList.length <= 0){
      window.alert("Nhà hàng phải có ít nhất 1 hình ảnh");
      return;
    }
    if (this.validateForm.valid) {
      this.isLoading = true;
      const formData = new FormData();
      formData.append('Name', this.validateForm.value['name']);
      formData.append('Address', this.validateForm.value['address']);
      formData.append('DistrictId', this.validateForm.value['district']);
      formData.append('OpenedTime', this.formatDateToString(this.validateForm.value['openTime']));
      formData.append('ClosedTime', this.formatDateToString(this.validateForm.value['closeTime']));
      formData.append('LowestCost', this.validateForm.value['lowPrice']);
      formData.append('HighestCost', this.validateForm.value['highPrice']);
      formData.append('Phone', this.validateForm.value['phoneNumber']);
      formData.append('Website', this.validateForm.value['website']);
      this.validateForm.value['category'].forEach((cate : any) => {
        formData.append('CatagoryId', cate);
      });
      this.fileList.forEach(file => {
        if (file.originFileObj) {
          formData.append('ResImages', file.originFileObj); 
        }
      });

      this.restaurantService.createRestaurant(Number(this.secureStorageService.getUserId()), formData).subscribe({
        next : (data : {message : string}) => {
          if(data){
            this.isLoading = false;
            window.alert(data.message);
            this.router.navigate(['/edit-restaurant']);
          }
        },
        error : (error) => {
          this.isLoading = false;
          window.alert("Không thể thêm mới nhà hàng");
          console.error(error.message);
        }
      })      
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

  loadProvince(){
  this.restaurantService.getProvinces().subscribe({
      next: (data : Province[]) => {
        this.provinces = data;
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
  

  handlePreview = async (file: NzUploadFile): Promise<void> => {
    if (!file.url && !file['preview']) {
      file['preview'] = await getBase64(file.originFileObj!);
    }
    this.previewImage = file.url || file['preview'];
    this.previewVisible = true;
  };

}

export function priceRangeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const lowPrice = control.get('lowPrice')?.value;
    const highPrice = control.get('highPrice')?.value;

    if (lowPrice != null && highPrice != null && (Number(lowPrice) < 0 || Number(highPrice) < 0)) {
      return { priceRange: true }; // Error if either price is less than 0
    }

    // Ensure highPrice is greater than or equal to lowPrice
    if (lowPrice != null && highPrice != null && Number(lowPrice) >= Number(highPrice)) {
      return { priceRange: true }; // Error if highPrice is less than or equal to lowPrice
    }
    return null; // Valid
  };
}

export function timeRangeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const openTime = control.get('openTime')?.value;
    const closeTime = control.get('closeTime')?.value;

    // Ensure both times are valid
    if (!openTime || !closeTime) {
      return null; // No validation needed if either is not provided yet
    }

    // Check if closeTime is after openTime
    if (closeTime <= openTime) {
      return { timeRange: 'Giờ đóng cửa phải lớn hơn giờ mở cửa!' };
    }

    return null; // No error
  };
}

export function combinedValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return priceRangeValidator()(control) || timeRangeValidator()(control);
  };
}

