import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Province } from '../../../models/admin/province.model';
import { District } from '../../../models/admin/district.model';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIcon } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { DistrictService } from '../../../services/admin/district.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-district',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatIcon, MatSelectModule, FormsModule, MatSortModule],
  templateUrl: './district.component.html',
  styleUrl: './district.component.css'
})
export class DistrictComponent implements AfterViewInit{
  // add edit
  editStatus = false;
  addStatus = false;
  editedDistrict: any = {
    name: '',
    selectedProvinces: []
  };
  newDistrict = {
    name: '',
    selectedProvince: null,
  };

  //filter
  searchTerm: string = '';
  selectedStatus: boolean = true;
  query: string = '';

  // phân trang
  districtDataSource = new MatTableDataSource<District>([]); 
  provinces: Province[] = [];
  districts: District[] = [];
  pageSize = 10;


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) districtSort!: MatSort; 
  @ViewChild('lockDialog') lockDialog!: any;

  constructor(private districtService: DistrictService, private dialog: MatDialog) {}

  ngOnInit(): void {
    // this.districtService.getDistricts().subscribe((districts: District[]) => {
    //   this.districts = districts;
    //   this.districtDataSource.data = districts;  // Set the data for the table
    //   console.log('Dữ liệu người dùng:', this.districts);
    // });
    // this.selectedStatus = true;
    this.provinces = [
      { id: 1, name: 'Hà Nội', isActive: true },
      { id: 2, name: 'Hồ Chí Minh', isActive: true },
      { id: 3, name: 'Đà Nẵng', isActive: true },
      { id: 4, name: 'Hải Phòng', isActive: true },
      { id: 5, name: 'Cần Thơ', isActive: true },
    ];

    this.districts = [
      { id: 1, name: 'Ba Đình', provinceId: 1, isActive: true },
      { id: 2, name: 'Đống Đa', provinceId: 1, isActive: true },
      { id: 3, name: 'Quận 1', provinceId: 2, isActive: true },
      { id: 4, name: 'Quận 3', provinceId: 2, isActive: false },
      { id: 5, name: 'Hải Châu', provinceId: 3, isActive: true },
      { id: 6, name: 'Thanh Khê', provinceId: 3, isActive: true },
      { id: 7, name: 'Lê Chân', provinceId: 4, isActive: false },
      { id: 8, name: 'Ngô Quyền', provinceId: 4, isActive: true },
      { id: 9, name: 'Ninh Kiều', provinceId: 5, isActive: true },
      { id: 10, name: 'Cái Răng', provinceId: 5, isActive: true },
    ];
    
    // this.provinceDataSource.data = this.provinces;
    
    // Gán tên tỉnh dựa vào provinceId
    this.districts = this.districts.map(district => {
      const province = this.provinces.find(prov => prov.id === district.provinceId);
      return {
        ...district,
        provinceName: province ? province.name : 'Unknown'
      };
    });

    this.districtDataSource.data = this.districts;
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

  // Mở form chỉnh sửa người dùng
  openEditForm(districtId: number): void {
    const district = this.districts.find((d) => d.id === districtId);
    if (district) {
      this.editedDistrict = {
        ...district,
        selectedProvinces: [district.provinceId], // Assuming a district initially belongs to one province
      };
      this.editStatus = true;
    }
  }

  // Close edit form
  goBack(): void {
    this.editStatus = false;
    this.editedDistrict = null;
  }

  closeAddForm(): void {
    this.newDistrict = {
      name: '',
      selectedProvince: null,
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

  // Lọc người dùng theo trạng thái (active/inactive)
  applyStatusFilter(): void {
    const filteredDistricts = this.districts.filter(district => 
      this.selectedStatus === null || 
      (district.isActive === true && this.selectedStatus === true) || 
      (district.isActive === false && this.selectedStatus === false)
    );
    console.log(this.selectedStatus);
    console.log(filteredDistricts);
    this.districtDataSource.data = filteredDistricts;
  }

  // Xóa tạm thời
  lockDistrict(districtId: number): void {
    this.districtService.lockDistrict(districtId).subscribe({
      next: (response) => {
        window.alert('User account locked successfully');
        // Reload data after locking
        this.ngOnInit();
      },
      error: (error) => {
        console.error('Error locking user:', error);
        window.alert('Error occurred while locking user');
      }
    });
  }


  // Hàm gọi API để tìm kiếm 
  onSearch(): void {
    if (this.searchTerm.trim() !== '') {
      this.districtService.searchDistricts(this.searchTerm).subscribe(
        (districts: District[]) => {
          this.districts = districts;
          this.districtDataSource.data = this.districts; // Cập nhật dữ liệu cho bảng
        },
        (error) => {
          console.error('Error searching districts:', error);
        }
      );
    } else {
      // Nếu không có từ khóa tìm kiếm, làm mới bảng (chạy lại tìm kiếm với từ khóa rỗng)
      this.districtService.getDistricts().subscribe(
        (districts: District[]) => {
          this.districts = districts;
          this.districtDataSource.data = this.districts; // Cập nhật dữ liệu cho bảng
        },
        (error) => {
          console.error('Error fetching districts:', error);
        }
      );
    }
  }

  // Hàm gọi API để lấy tất cả người dùng
  loadDistricts(): void {
    // this.districtService.getDistricts().subscribe(
    //   (districts: District[]) => {
    //     this.districts = districts;
    //     this.districtDataSource.data = this.districts;
    //   },
    //   (error) => {
    //     console.error('Error fetching districts:', error);
    //   }
    // );
  }

  openAddDistrictForm(){
    this.addStatus = true;
  }

  onSave(){
    console.log('Saved District:', this.editedDistrict);
    // Thực hiện lưu thông tin ở đây
  }

  restaurants = [
    { id: 1, districtId: 1, name: 'Restaurant A' },
    { id: 2, districtId: 1, name: 'Restaurant B' },
    { id: 3, districtId: 2, name: 'Restaurant C' },
    { id: 4, districtId: 3, name: 'Restaurant D' },
    { id: 5, districtId: 5, name: 'Restaurant E' },
  ];
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

      console.log(districtId)
      this.closeDialog();

      // cần LOAD LẠI TABLE
    }
  }
}
