declare var google: any;

import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MdbDropdownModule } from 'mdb-angular-ui-kit/dropdown';
import { MdbCollapseModule } from 'mdb-angular-ui-kit/collapse';
import { FormsModule } from '@angular/forms';
import { District, Province } from '../../models/district.model';
import { RestaurantService } from '../../services/restaurant.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Category } from '../../models/category.model';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { SecureStorageService } from '../../services/secure-storage.service';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { Restaurant } from '../../models/restaurant.model';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MdbDropdownModule, MdbCollapseModule, FormsModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent implements OnInit, OnChanges{
  provinces : Province[] = [];
  categories : Category[] = [];
  districts : District[] = [];
  checkedCategories : number[] = [];
  checkedDistricts : number[] = [];
  @Input() provinceId !: number | null;
  Math = Math;
  isUserLoggedIn : boolean = false;
  user !: User;

  checkboxes = Array(10).fill(0);
  checkboxStates = Array(this.checkboxes.length).fill(false);
  dropDownProvince = 'Hồ Chí Minh';

  searchText: string = '';
  filteredOptions: Restaurant[] = [];
  private searchSubject = new Subject<string>();

  // admin
  isAdmin: boolean = false;

  constructor(private restaurantService: RestaurantService, private userService : UserService, private secureStorageService : SecureStorageService, private searchService : SearchService, private router : Router) {};

  ngOnInit(): void {
    this.getProvinces();
    this.getCategories();
    this.isUserLoggedIn = this.userService.isLoggedIn();
    if(this.isUserLoggedIn){
      const storedUserId = Number(this.secureStorageService.getUserId());
      this.userService.getUserById(storedUserId).subscribe({
        next: (data: User) => {
          if (data) {
            this.user = data;
          }
        },
        error: (error) => {
          console.error('Error fetching user:', error);
          window.alert('An error occurred while fetching the user.');
        },
        complete: () => {
          console.log('getUserById request completed.');
        },
      });
      const role = this.secureStorageService.getRole();
      this.isAdmin = role === 'AD'; 
    }

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query) => this.restaurantService.filterRestaurants(query, this.checkedDistricts, this.checkedCategories))).subscribe({
      next: (data : Restaurant[]) => {
        this.filteredOptions = data;
      },
      error: (error) => {
        console.error('Error fetching search results:', error);
        this.filteredOptions = [];
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['provinceId'] && this.provinceId) {
      this.getProvinces();
    }
  }

  getProvinces(){
    this.restaurantService.getProvinces().subscribe({
      next: (data : Province[]) => {
        if(data){
          this.provinces = data;
          const foundProvince = this.provinces.find(province => province.id === this.provinceId);
          console.log(this.provinceId);
          if (foundProvince) {
            this.dropDownProvince = foundProvince.name;
          } else {
            console.log('Province not found.');
          }
          this.checkedDistricts = [];
          this.getDistrict();
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

  getCategories(){
    this.restaurantService.getCategories().subscribe(data => {
      this.categories = data;
    })

    this.restaurantService.getCategories().subscribe({
      next: (data : Category[]) => {
        if(data){
          this.categories = data;
        }    
      }, 
      error: (error) => {
        console.error('Error fetching categories:', error);
        window.alert('An error occurred while fetching the categories.');
      },complete: () => {
        console.log('getCategories request completed.');
      },
    })
  }

  getDistrict(){
    const province = this.provinces.find(p => p.id === this.provinceId);
    this.districts = province ? province.districts : [];
  }

  onCheckboxChange(categoryId: number, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.checkedCategories.push(categoryId);
    } else {
      this.checkedCategories = this.checkedCategories.filter(id => id !== categoryId);
    }
  }

  onCheckBoxDistrictChange(districtId: number, event: Event){
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.checkedDistricts.push(districtId);
    } else {
      this.checkedDistricts = this.checkedDistricts.filter(id => id !== districtId);
    }
  }
  
  updateDropdown(text: string, id : number,event: Event) {
    event.preventDefault();
    this.router.navigate([`/province/${id}`]);
  }

  uncheckAll() {
    this.checkedCategories = [];
    this.checkedDistricts = [];
    const checkboxes = document.querySelectorAll('.form-check-input') as NodeListOf<HTMLInputElement>;
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
  }

  onSearch(): void {
    if (this.searchText.trim()) {
      this.searchSubject.next(this.searchText.trim());
    } else {
      this.filteredOptions = [];
    }
  }

  onSelectOption(option: Restaurant): void {
    
  }

  logOut(){
    this.secureStorageService.clearStorage();
    google.accounts.id.disableAutoSelect();
    window.location.reload();
  }

  searchButton(): void{
    this.searchService.updateSearchCriteria({
      query: this.searchText.trim(),
      districtIds : this.checkedDistricts,
      categoryIds : this.checkedCategories
    });
    this.router.navigate(['/search']);
  }

  searchExceptQuery(): void{
    this.searchService.updateSearchCriteria({
      query: '',
      districtIds : this.checkedDistricts,
      categoryIds : this.checkedCategories
    });
    this.router.navigate(['/search']);
  }

  changeRes(): void{
    this.restaurantService.getUserRestaurant(this.user.id).subscribe({
      next : (data : Restaurant[]) => {
        if(data){
          console.log(data);
          if(data.length > 0){
            this.router.navigate(['/edit-restaurant']);
          }else{
            this.router.navigate(['/add-restaurant']);
          }
        }
      },
      error: (error) => {
        console.error('Error fetching user restaurant:', error);
        window.alert('An error occurred while fetching user restaurant.');
      }
    })
  }
}
