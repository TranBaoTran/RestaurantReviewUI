import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Province } from '../../../models/admin/province.model';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIcon } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { ProvinceService } from '../../../services/admin/province.service';

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
    name: '',
  };
  new = {
    name: '',
  };

  //filter
  isDropdownVisible = false;
  searchTerm: string = '';
  selectedStatus: boolean = true;
  query: string = '';

  // phân trang
  provinceDataSource = new MatTableDataSource<Province>([]);
  provinces: Province[] = [];
  pageSize = 10;

  // dialog confirm
  deleteProvinceId: number | null = null;


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort; 
  @ViewChild('lockDialog') lockDialog!: any;

  constructor(private provinceService: ProvinceService, private dialog: MatDialog) {}

  ngOnInit(): void {
    // this.provinceService.getDistricts().subscribe((districts: District[]) => {
    //   this.districts = districts;
    //   this.provinceDataSource.data = districts;  // Set the data for the table
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
    
    this.provinceDataSource.data = this.provinces;
    
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

  // Mở form chỉnh sửa người dùng
  openEditForm(provinceId: number): void {
    const province = this.provinces.find((d) => d.id === provinceId);
    if (province) {
    // Gán giá trị của Province được chọn vào editedProvince
    this.editedProvince = {
      name: province.name,
    };
    this.editStatus = true; // Bật trạng thái chỉnh sửa
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
  

  // Tìm kiếm người dùng theo tên
  applySearch(): void {
    const filterProvince = this.provinces.filter(province => 
      province.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.provinceDataSource.data = filterProvince;
  }


  // Hàm gọi API để tìm kiếm 
  onSearch(): void {
    // if (this.searchTerm.trim() !== '') {
    //   this.provinceService.searchprovinces(this.searchTerm).subscribe(
    //     (provinces: Province[]) => {
    //       this.provinces = provinces;
    //       this.provinceDataSource.data = this.provinces; // Cập nhật dữ liệu cho bảng
    //     },
    //     (error) => {
    //       console.error('Error searching provinces:', error);
    //     }
    //   );
    // } else {
    //   // Nếu không có từ khóa tìm kiếm, làm mới bảng (chạy lại tìm kiếm với từ khóa rỗng)
    //   this.provinceService.getprovinces().subscribe(
    //     (provinces: Province[]) => {
    //       this.provinces = provinces;
    //       this.provinceDataSource.data = this.provinces; // Cập nhật dữ liệu cho bảng
    //     },
    //     (error) => {
    //       console.error('Error fetching provinces:', error);
    //     }
    //   );
    // }
  }

  // Hàm gọi API để lấy tất cả người dùng
  loadProvince(): void {
    // this.provinceService.getDistricts().subscribe(
    //   (districts: District[]) => {
    //     this.districts = districts;
    //     this.provinceDataSource.data = this.districts;
    //   },
    //   (error) => {
    //     console.error('Error fetching districts:', error);
    //   }
    // );
  }

  openAddForm(){
    this.addStatus = true;
  }

  onSave(){
    console.log('Saved District:', this.editedProvince);
    // Thực hiện lưu thông tin ở đây
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

      console.log(provinceId)
      this.closeDialog();

      // cần LOAD LẠI TABLE
    }
  }
}
