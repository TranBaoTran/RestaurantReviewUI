import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { District } from '../../../models/admin/district.model';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIcon } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { ProvinceService } from '../../../services/admin/province.service';
import { Restaurant } from '../../../models/restaurant.model';
import { RestaurantService } from '../../../services/restaurant.service';
import { Province } from '../../../models/district.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-district',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatIcon, MatSelectModule, FormsModule, MatSortModule, RouterModule],
  templateUrl: './district.component.html',
  styleUrl: './district.component.css'
})
export class DistrictComponent implements AfterViewInit{
  // add edit
  editStatus = false;
  addStatus = false;
  editedDistrict: any = {
    id : -1,
    name: '',
    selectedProvince: -1
  };
  newDistrict = {
    name: '',
    selectedProvince: -1,
  };

  //filter
  searchTerm: string = '';
  selectedStatus: boolean = true;
  query: string = '';

  // phân trang
  districtDataSource = new MatTableDataSource<District>([]); 
  districts: District[] = [];
  provinces : Province[] = [];
  restaurants : Restaurant[] = []
  selectedProvince : number = -1
  pageSize = 10;


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) districtSort!: MatSort; 
  @ViewChild('lockDialog') lockDialog!: any;

  constructor(private provinceService: ProvinceService, private dialog: MatDialog, private restaurantService : RestaurantService) {}

  ngOnInit(): void {
    this.getAllDistrict();
    this.getAllProvinces();
    this.getAllRes();
  }

  getAllDistrict(): void{
    this.provinceService.getAllDistrict().subscribe({
      next : (data : District[]) => {
       if(data){
        this.districts = data;
        this.districtDataSource.data = this.districts;
        this.onFilterChange()
       }
      },
      error : (error) => {
        console.error(error.error?.message);
      }
    })
  }

  getAllProvinces(): void{
    this.restaurantService.getProvinces().subscribe({
      next : (data : Province[]) => {
        if(data){
         this.provinces = data;
        }
       },
       error : (error) => {
         console.error(error.error?.message);
       }
    })
  }

  getAllRes(): void{
    this.restaurantService.getAllRestaurant().subscribe({
      next : (data : Restaurant[]) => {
        if(data){
         this.restaurants = data.filter(res => res.status == "accepted");
        }
       },
       error : (error) => {
         console.error(error.error?.message);
       }
    })
  }

  ngAfterViewInit() {
    this.districtDataSource.paginator = this.paginator;  // Bind paginator to the table
    this.districtDataSource.sort = this.districtSort;
  }

  updatePaginatedDistricts(pageIndex: number): void {
    const startIndex = pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.districtDataSource.data = this.districts.slice(startIndex, endIndex);
  }

  onFilterChange(){
    if(this.selectedProvince == -1){
      this.districtDataSource.data = this.districts
    }else{
      const filterDistrict = this.districts.filter(dis => dis.provinceId === this.selectedProvince)
      this.districtDataSource.data = filterDistrict
    }
  }

  // Mở form chỉnh sửa người dùng
  openEditForm(districtId: number): void {
    const district = this.districts.find((d) => d.id === districtId);
    if (district) {
      this.editedDistrict = {
        id : district.id,
        name : district.name,
        selectedProvince: district.provinceId,
      };
      this.editStatus = true;
    }
  }

  // Close edit form
  goBack(): void {
    this.editStatus = false;
    this.editedDistrict = {
      id : -1,
      name : '',
      selectedProvince: -1,
    };;
  }

  closeAddForm(): void {
    this.newDistrict = {
      name: '',
      selectedProvince: -1,
    };
    this.addStatus = false;
  }
  

  // Tìm kiếm người dùng theo tên
  applySearch(): void {
    const filterDistrict = this.districts.filter(district => 
      district.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.districtDataSource.data = filterDistrict;
  }

  openAddDistrictForm(){
    this.addStatus = true;
  }

  onAdd(){
    this.provinceService.addDistrict(this.newDistrict.name, this.newDistrict.selectedProvince).subscribe({
      next : (data : {message : string}) => {
        if(data){
          window.alert(data.message);
          this.getAllDistrict();
          this.closeAddForm();
        }
       },
       error : (error) => {
          if (error.status === 400){
            window.alert(error.error?.message);
          }else{
            console.error('Error:', error);
          }  
       }
    })
  }

  onSave(){
    this.provinceService.updateDistrict(this.editedDistrict.name, this.editedDistrict.id).subscribe({
      next : (data : {message : string}) => {
        if(data){
          window.alert(data.message);
          this.getAllDistrict();
          this.goBack();
        }
       },
       error : (error) => {
          if (error.status === 400){
            window.alert(error.error?.message);
          }else{
            console.error('Error:', error);
          }  
       }
    })
  }

  selectedDistrictId: number | null = null;
  selectedDistrictName: string | null = null;
  restaurantsInDistrict: any[] = [];
  isRestaurantPopupVisible: boolean = false;
  deleteDistrictId: number | null = null;

  getRestaurantCount(districtId: number): number {
    return this.restaurants.filter(restaurant => restaurant.districtId === districtId).length;
  }

  showRestaurants(districtId: number): void {
    this.selectedDistrictId = districtId;
    // Lọc nhà hàng theo districtId
    this.restaurantsInDistrict = this.getRestaurantsByDistrict(districtId);
    this.isRestaurantPopupVisible = true; // Hiển thị popup
  }

  closeRestaurantPopup(): void {
    this.isRestaurantPopupVisible = false;
    this.restaurantsInDistrict = [];
    this.selectedDistrictId = null;
  }

  // có thể gom lại hàm dưới qua showRestaurant tại cái này chỉ có 1 dòng chạy tìm filter dưới
  getRestaurantsByDistrict(districtId: number): any[] {
    return this.restaurants.filter(restaurant => restaurant.districtId === districtId);
  }

  // Hiển thị tên district thay vì ID
  getDistrictNameById(districtId: number): string {
    const district = this.districts.find(d => d.id === districtId);
    return district ? district.name : '';
  }

  // Method to open the lock dialog for a specific district
  openDeleteDialog(districtId: number): void {
    if (districtId) {
      this.deleteDistrictId = districtId;
      this.dialog.open(this.lockDialog);
    }
  }

  closeDialog(): void {
    this.dialog.closeAll(); 
  }

  confirmDelete(): void{
    if (this.deleteDistrictId !== null && this.deleteDistrictId !== undefined) { 
      const districtId = this.deleteDistrictId;
      this.provinceService.deleteDistrict(districtId).subscribe({
        next : () => {
            window.alert("Xoá thành công");
            this.getAllDistrict();
            this.closeDialog();
         },
         error : (error) => {
            if (error.status === 400){
              window.alert(error.error?.message);
            }else{
              console.error('Error:', error);
            }  
         }
      })
    }
  }
}
