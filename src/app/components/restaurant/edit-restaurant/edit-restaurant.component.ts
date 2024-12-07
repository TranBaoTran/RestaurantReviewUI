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
  ValidatorFn
} from '@angular/forms';
import { Observable, Subject, Subscription, switchMap, tap } from 'rxjs';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzUploadFile, NzUploadModule, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
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
import { Restaurant, SentRestaurant} from '../../../models/restaurant.model';
import { Image } from '../../../models/restaurant.model';
import { SecureStorageService } from '../../../services/secure-storage.service';
import { CommonModule } from '@angular/common';

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
    NzCheckboxModule, NzFormModule, NzInputModule, NzSelectModule, CommonModule, NzTypographyModule],
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
  isLoading = false; 
  isUploadDisabled = false;

  constructor(private router:Router, private route : ActivatedRoute, private fb:NonNullableFormBuilder, private restaurantService:RestaurantService, private secureStorageService : SecureStorageService){
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

  ngOnInit(): void {
    this.loadRestaurant()
    .pipe(
      switchMap(() => this.loadProvince()),
      switchMap(() => this.loadCategory()),
      switchMap(() => this.loadResCate()),
      switchMap(() => this.loadResImages()),
    )
    .subscribe({
      next: () => {
        console.log('All data loaded successfully');
        this.checkStatus();
      },
      error: (err) => {
        if (err.status === 401) {
          window.alert("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại!");
          this.secureStorageService.clearStorage();
          google.accounts.id.disableAutoSelect();
          this.router.navigate(['/login']);
        } else {
          console.error('Error loading data:', err);
        }      
      },
    });
  }

  checkStatus(): void{
    if(this.restaurant.status == "waiting"){
      this.validateForm.disable();
      this.isUploadDisabled = true;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submitForm(): void {
    if (this.fileList.length <= 0){
      window.alert("Nhà hàng phải có ít nhất 1 hình ảnh.");
      return;  
    }

    if (this.validateForm.valid) {
      this.isLoading = true;
      const sentRes : SentRestaurant = {
        name : this.validateForm.value['name'],
        address : this.validateForm.value['address'],
        openedTime : this.formatDateToString(this.validateForm.value['openTime']),
        closedTime : this.formatDateToString(this.validateForm.value['closeTime']),
        lowestCost : this.validateForm.value['lowPrice'],
        highestCost : this.validateForm.value['highPrice'],
        phone : this.validateForm.value['phoneNumber'],
        website : this.validateForm.value['website'],
        districtId : this.validateForm.value['district'],
        catagoryId: this.validateForm.value['category'].map((cat: any) => cat)
      }
      console.log(sentRes);
      this.restaurantService.updateRestaurant(this.restaurant.id, sentRes).subscribe({
        next : (data : {message : string}) => {
          if(data){
            this.isLoading = false;
            window.alert(data.message);
          }
        },
        error : (error) => {
          window.alert("Không thể lưu thông tin.");
          console.error('Error : '+ error.message);
          this.isLoading = false;
        }
      });
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  clickReSendAcceptRes(): void{
    if (this.fileList.length <= 0){
      window.alert("Nhà hàng phải có ít nhất 1 hình ảnh.");
      return;  
    }

    if (this.validateForm.valid) {
      this.isLoading = true;
      const sentRes : SentRestaurant = {
        name : this.validateForm.value['name'],
        address : this.validateForm.value['address'],
        openedTime : this.formatDateToString(this.validateForm.value['openTime']),
        closedTime : this.formatDateToString(this.validateForm.value['closeTime']),
        lowestCost : this.validateForm.value['lowPrice'],
        highestCost : this.validateForm.value['highPrice'],
        phone : this.validateForm.value['phoneNumber'],
        website : this.validateForm.value['website'],
        districtId : this.validateForm.value['district'],
        catagoryId: this.validateForm.value['category'].map((cat: any) => cat)
      }
      console.log(sentRes);
      this.restaurantService.requestAcceptRestaurant(this.restaurant.id, sentRes).subscribe({
        next : (data : {message : string}) => {
          if(data){
            this.isLoading = false;
            window.alert("Gửi xét duyệt thành công.");
            window.location.reload();
          }
        },
        error : (error) => {
          console.error('Error : '+ error.message);
          this.isLoading = false;
        }
      });
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  formatDateToString(date: Date | null): string {
    if (!date) return '';
    const localDate = new Date(date);
    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
    return localDate.toISOString().split('T')[1].substring(0, 8); // Extract time part: HH:mm
  }

  onTimeChange(): void {
    this.validateForm.get('openTime')?.updateValueAndValidity();
    this.validateForm.get('closeTime')?.updateValueAndValidity();
  }

  loadCategory(): Observable<Category[]> {
    return this.restaurantService.getCategories().pipe(
      tap((data: Category[]) => {
        this.categories = data;
      })
    )
  }

  loadResCate(): Observable<Category[]> {
    return this.restaurantService.getRestaurantCategoryByResId(this.restaurant.id).pipe(
      tap((data : Category[]) => {
        this.restaurantCategory = data;
        this.selectedCategories = this.restaurantCategory.map(item => item.id)
      }
      )
    )
  }

  loadProvince(): Observable<Province[]>{
  return this.restaurantService.getProvinces().pipe(
      tap ((data : Province[]) => {
        this.provinces = data;
        this.selectedProvinceId = this.getDistrictAndProvinceName(this.restaurant.districtId,this.provinces);
      })
    )
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

  loadResImages(): Observable<Image[]> {
    return this.restaurantService.getImagesByRestaurantId(this.restaurant.id).pipe(
      tap( (image: Image[]) => {
        this.resImage = image
        this.fileList = this.convertImagesToNzUploadFiles(this.resImage);
      })
    )
  }

  loadRestaurant(): Observable<Restaurant[]> {
    return this.restaurantService.getUserRestaurant(Number(this.secureStorageService.getUserId())).pipe(
      tap((data: Restaurant[]) => {
        if (data?.length > 0) {
          this.restaurant = data[0];
          this.currentOpenTime = this.convertStringToDate(this.restaurant.openedTime);
          this.currentCloseTime = this.convertStringToDate(this.restaurant.closedTime);
        } else {
          this.router.navigate(['/add-restaurant']);
        }
      })
    )
  }

  onRemove = (file: NzUploadFile): boolean => {
    if(this.restaurant.status == "waiting"){
      return false;
    }

    if (!file.uid) {
      console.error('No UID found for the file');
      window.alert('Cannot delete the image without a valid UID.');
      return false; // Prevent removal.
    }
  
    this.isLoading = true;
    this.restaurantService.delRestaurantImg(this.restaurant.id, file.uid).subscribe({
      next: (data: { message: string }) => {
        this.isLoading = false;
        window.alert(data.message);
        this.fileList = this.fileList.filter(item => item.uid !== file.uid);
      },
      error: (err) => {
        console.error('Failed to delete the image:', err);
        this.isLoading = false;
        window.alert('Failed to delete the image');
      }
    });
  
    return false;
  };

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
  
    const [hours, minutes, second] = timeString.split(':').map(Number);
  
    // Tạo đối tượng Date mới với giờ, phút, giây
    const now = new Date();
    now.setHours(hours, minutes, second || 0, 0);
  
    return now;
  }

  goToDetailRes(id : number): void{
    this.router.navigate([`/restaurants/${id}`])
  }

  onCustomRequest = (item: NzUploadXHRArgs): Subscription  => {
    const { file } = item;  
    if (file instanceof File) {
      const formData = new FormData();
      formData.append('images', file); // Cast to `File` for FormData
  
      this.isLoading = true;
  
      return this.restaurantService.addRestaurantImg(this.restaurant.id, formData).subscribe({
        next: (data: Image[]) => {
          if(data.length > 0) {
            this.isLoading = false;
            window.alert("Thêm ảnh thành công");
            item.onSuccess!({}, file, {}); 
            const nzFile: NzUploadFile = {
              ...item.file!,
              uid: data[0].publicId, 
              name: data[0].imgPath.split('/').pop() || 'unknown',
              url: data[0].imgPath,
              status: 'done',
            };
            this.fileList = this.fileList.map(f =>
              f.uid === item.file?.uid ? nzFile : f
            );
          }
        },
        error: (err) => {
          console.error('Upload failed:', err);
          this.isLoading = false;
          item.onError!(err, file);
        }
      });
    } else {
      console.error('File is not a Blob or File!');
      item.onError!(new Error('Invalid file type'), file);
      return new Subscription();
    }
  };

  delRestaurant(): void{
    this.isLoading = true;
    this.restaurantService.deleteRestaurant(this.restaurant.id).subscribe({
      next : (data : { message: string }) => {
        if(data){
          this.isLoading = false;
          this.router.navigate(['']);
        }
      },
      error : (error) => {
        this.isLoading = false;
        window.alert("Không thể xoá nhà hàng. Đã có lỗi xảy ra.")
        console.log("Error : "+error.message);
      }
    })
  }
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

