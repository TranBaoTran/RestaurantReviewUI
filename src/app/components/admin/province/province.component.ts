var google : any;

import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIcon } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { ProvinceService } from '../../../services/admin/province.service';
import { Province } from '../../../models/district.model';
import { RestaurantService } from '../../../services/restaurant.service';
import { Router } from '@angular/router';
import { SecureStorageService } from '../../../services/secure-storage.service';

@Component({
  selector: 'app-province',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatIcon, MatSelectModule, FormsModule, MatSortModule],
  templateUrl: './province.component.html',
  styleUrl: './province.component.css'
})
export class ProvinceComponent implements AfterViewInit{
  // add edit
  editStatus = false;
  addStatus = false;
  editedProvince: any = {
    id : -1,
    name: ''
  };
  new = {
    name: '',
  };

  //filter
  isDropdownVisible = false;
  searchTerm: string = '';
  selectedStatus: boolean = true;

  // phân trang
  provinceDataSource = new MatTableDataSource<Province>([]);
  provinces: Province[] = [];
  pageSize = 10;

  // dialog confirm
  deleteProvinceId: number | null = null;


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort; 
  @ViewChild('lockDialog') lockDialog!: any;

  constructor(private restaurantService : RestaurantService, private dialog: MatDialog, private provinceService : ProvinceService, private secureStorageService : SecureStorageService, private router : Router) {}

  ngOnInit(): void {
    this.getProvince();
  }

  ngAfterViewInit() {
    this.provinceDataSource.paginator = this.paginator;  // Bind paginator to the table
    this.provinceDataSource.sort = this.sort;
  }

  updatePaginatedProvinces(pageIndex: number): void {
    const startIndex = pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.provinceDataSource.data = this.provinces.slice(startIndex, endIndex);
  }

  getProvince(): void{
    this.restaurantService.getProvinces().subscribe({
      next : (data : Province[]) => {
        this.provinces = data;
        this.provinceDataSource.data = this.provinces;
      },
      error : (error) => {
        console.log("Error fetching province by id:" + error);
      }
    });
  }

  // Mở form chỉnh sửa người dùng
  openEditForm(provinceId: number): void {
    const province = this.provinces.find((d) => d.id === provinceId);
    if (province) {
      this.editedProvince = {
        id: province.id,
        name: province.name
      };
      this.editStatus = true; 
    }
  }

  // Close edit form
  goBack(): void {
    this.editStatus = false;
    this.editedProvince = null;
  }

  closeAddForm(): void {
    this.new = {
      name: '',
    };
    this.addStatus = false;
  }
  
  addProvince(): void{
    this.provinceService.addProvince(this.new.name).subscribe({
      next : (data : {message : string}) => {
        if (data) {
          window.alert(data.message);
          this.getProvince();
          this.closeAddForm();
        }
      },
      error : (err) => {
        if (err.status === 401) {
          window.alert("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại!");
          this.secureStorageService.clearStorage();
          google.accounts.id.disableAutoSelect();
          this.router.navigate(['/login']);
        } else {
          window.alert(err.error?.message);
          console.error('Error :', err);
        }  
      }
    })
  }

  // Tìm kiếm người dùng theo tên
  applySearch(): void {
    const filterProvince = this.provinces.filter(province => 
      province.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.provinceDataSource.data = filterProvince;
  }

  openAddForm(){
    this.addStatus = true;
  }

  onSave(){
    this.provinceService.updateProvinceById(this.editedProvince.id, this.editedProvince.name).subscribe({
      next : (data : {message : string}) => {
        if (data) {
          window.alert(data.message);
          this.getProvince();
          this.goBack();
        }
      },
      error : (err) => {
        if (err.status === 401) {
          window.alert("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại!");
          this.secureStorageService.clearStorage();
          google.accounts.id.disableAutoSelect();
          this.router.navigate(['/login']);
        } else {
          window.alert(err.error?.message);
          console.error('Error :', err);
        }  
      }
    })
  }

  openDeleteDialog(provinceId: number): void {
    if (provinceId) {
      this.deleteProvinceId = provinceId;
      this.dialog.open(this.lockDialog);
    }
  }

  closeDialog(): void {
    this.dialog.closeAll(); 
  }

  confirmDelete(): void{
    if (this.deleteProvinceId !== null && this.deleteProvinceId !== undefined) { 
      const provinceId = this.deleteProvinceId;
      this.provinceService.deleteProvince(provinceId).subscribe({
        next : () => {
            window.alert("Xoá khu vực thành công.");
            this.getProvince();
            this.closeDialog();
        },
        error : (err) => {
          if (err.status === 401) {
            window.alert("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại!");
            this.secureStorageService.clearStorage();
            google.accounts.id.disableAutoSelect();
            this.router.navigate(['/login']);
          } else {
            window.alert(err.error?.message);
            console.error('Error :', err);
          }  
        }
      })   
    }
  }
}
