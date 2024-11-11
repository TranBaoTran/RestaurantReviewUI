import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MdbDropdownModule } from 'mdb-angular-ui-kit/dropdown';
import { MdbCollapseModule } from 'mdb-angular-ui-kit/collapse';
import { FormsModule } from '@angular/forms';
import { District, Province } from '../../models/district.model';
import { RestaurantService } from '../../services/restaurant.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Category } from '../../models/category.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MdbDropdownModule, MdbCollapseModule, FormsModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent implements OnInit{
  provinces : Province[] = [];
  categories : Category[] = [];
  districts : District[] = [];
  checkedCategories : number[] = [];
  checkedDistricts : number[] = [];
  provinceId : number = 2;
  Math = Math;
  isUserLoggedIn : boolean = false;
  

  checkboxes = Array(10).fill(0);
  checkboxStates = Array(this.checkboxes.length).fill(false);
  dropDownProvince = 'Hồ Chí Minh';

  constructor(private restaurantService: RestaurantService, private userService : UserService) {};

  ngOnInit(): void {
    this.getProvinces();
    this.getCategories();
    this.isUserLoggedIn = this.userService.isLoggedIn();
  }

  getProvinces(){
    this.restaurantService.getProvinces().subscribe(data => {
      this.provinces = data;
      this.getDistrict();
    })
  }

  getCategories(){
    this.restaurantService.getCategories().subscribe(data => {
      this.categories = data;
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
    this.dropDownProvince = text;
    this.provinceId = id;
    this.getDistrict();
  }

  uncheckAll() {
    this.checkedCategories = [];
    const checkboxes = document.querySelectorAll('.form-check-input') as NodeListOf<HTMLInputElement>;
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
  }

  logOut(){
    this.userService.logOut();
    window.location.reload();
  }
}
