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

  constructor(private fb:NonNullableFormBuilder, private restaurantService:RestaurantService){
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
    this.loadProvince()
    this.loadCategory()
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submitForm(): void {
    if (this.validateForm.valid) {
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

