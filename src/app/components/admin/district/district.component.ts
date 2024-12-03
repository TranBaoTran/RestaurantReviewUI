import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Province } from '../../../models/admin/province.model';
import { CreateDistrictDTO, District } from '../../../models/admin/district.model';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIcon } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { DistrictService } from '../../../services/admin/district.service';
import { MatDialog } from '@angular/material/dialog';
import { ProvinceService } from '../../../services/admin/province.service';

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
  newDistrict: CreateDistrictDTO = {
    id: 0,
    name:'',
    provinceId: 0,
    isActive: true,
  };
  editedDistrict: CreateDistrictDTO = {
    id: 0,
    name:'',
    provinceId: 0,
    isActive: true,
  };
  provinces: Province[] = [];

  //filter
  searchTerm: string = '';
  selectedStatus: boolean = true;
  query: string = '';

  // phân trang
  districts: District[] = [];
  districtsSelected: District[] = [];
  pageSize = 10;
  districtDataSource = new MatTableDataSource<District>([]); 
  selectedProvinces: number[] = [];
  selectedDistricts: number = -1; // Selected districts

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) districtSort!: MatSort; 
  @ViewChild('lockDialog') lockDialog!: any;

  constructor(private districtService: DistrictService, protected provinceService: ProvinceService,private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadDistricts();
    this.loadProvince();
    // this.loadDistricts2();
  }

  // Load danh sách tất cả các districts
  loadDistricts(): void {
    this.districtService.getDistricts().subscribe(
      (data) => {
        this.districts = data;
        this.districtDataSource.data = this.districts;
        console.log(data);
      },
      (error) => {
        console.error('Error loading districts:', error);
      }
    );
    console.log(this.districts);
  }

  loadProvince(): void {
    this.provinceService.getProvinces().subscribe(
      (data) => {
        this.provinces = data;      
        console.log(data);
        
      },
      (error) => {
        console.error('Error loading provinces:', error);
      }
    );
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
  const district = this.districts.find((p) => p.id === districtId);
  if (district) {
    this.editedDistrict = {
      id: district.id,
      name: district.name,
      provinceId: district.province.id, 
      isActive: district.isActive  
    };
    console.log(district);
    
    // Không cần gán selectedDistricts, mà gán provinceId vào editedDistrict
    this.editStatus = true; // Mở trạng thái chỉnh sửa
  } else {
    console.error('District not found');
  }
}


  goBack(): void {
    this.editStatus = false;
    this.editedDistrict = { id: 0, name: '', provinceId: 0 , isActive: true}; 
  }
  

  closeAddForm(): void {
    // this.newDistrict = {
    //   name: '',
    //   selectedProvince: null,
    // };
    this.addStatus = false;
  }
  

  // Tìm kiếm người dùng theo tên
  applySearch(): void {

  }

  // Lọc người dùng theo trạng thái (active/inactive)
  applyStatusFilter(): void {

  }

  // Xóa tạm thời
  deleteDistrict(id: number): void {

  }


  // Hàm gọi API để tìm kiếm 
  onSearch(): void { 
    console.log(this.searchTerm); // Xem từ khóa tìm kiếm
    if (this.searchTerm.trim() !== '') {
      this.districtService.searchDistricts(this.searchTerm).subscribe(
        (districts: District[]) => {
          console.log(districts); // Kiểm tra kết quả tìm kiếm từ API
          this.districts = districts;
          this.districtDataSource.data = this.districts;
        },
        (error) => {
          console.error('Error searching districts:', error);
        }
      );
    } else {
      this.loadDistricts(); // Nếu từ khóa rỗng, tải lại toàn bộ dữ liệu
    }      
  }
  

  openAddDistrictForm(){
    this.addStatus = true;
  }

  onSave(): void {
    if (this.addStatus) {
      // Gọi API để thêm tỉnh mới
      console.log(this.newDistrict);
    
      this.districtService.createDistrict(this.newDistrict).subscribe(
        (newDistrict: CreateDistrictDTO) => {
          this.loadDistricts();
          this.closeAddForm(); // Đóng form thêm
          console.log(newDistrict);
          
        },
        (error) => {
          console.error('Error creating districts:', error);
        }
      );
    } else if (this.editStatus) {
      // Gọi API để cập nhật tỉnh
      console.log(this.editedDistrict);    
      // Đảm bảo gởi đúng dữ liệu của editedDistrict
      this.districtService.updateDistrict(this.editedDistrict.id, this.editedDistrict).subscribe(
        () => {
          this.loadDistricts(); // Tải lại danh sách quận/huyện
          this.goBack(); // Đóng form chỉnh sửa
        },
        (error) => {
          console.error('Error updating district:', error);
        }
      );
    }
  }
  



  selectedDistrictId: number | null = null;
  selectedDistrictName: string | null = null;
  restaurantsInDistrict: any[] = [];
  isRestaurantPopupVisible: boolean = false;
  deleteDistrictId: number | null = null;

  // Hiển thị các nhà hàng khi nhấn vào districtId
showRestaurants(districtId: number): void {
  this.selectedDistrictId = districtId;
  this.selectedDistrictName = this.getDistrictNameById(districtId);
  
  // Gọi service để lấy thông tin nhà hàng cho district
  this.getRestaurantsForDistrict(districtId);
}

// Lấy thông tin nhà hàng cho district từ service
getRestaurantsForDistrict(districtId: number): void {

}

  closeRestaurantPopup(): void {
    this.isRestaurantPopupVisible = false;
    this.restaurantsInDistrict = [];
    this.selectedDistrictId = null;
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

  confirmDelete(): void {
    if (this.deleteDistrictId !== null) {
      this.districtService.deleteDistrict(this.deleteDistrictId).subscribe(
        () => {
          this.loadDistricts();
          this.closeDialog(); // Đóng hộp thoại
        },
        (error) => {
          console.error('Error deleting district:', error);
        }
      );
    }
  }
}
