import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Province } from '../../../models/admin/province.model';
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
    new: Province = {
      id: 0,
      name: '',
      isActive: true,
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
      this.loadProvinces(); // Tải danh sách tỉnh từ API
      this.onSearch();
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
      const province = this.provinces.find((p) => p.id === provinceId);
      if (province) {
        this.editedProvince = { ...province }; // Sao chép toàn bộ dữ liệu tỉnh, bao gồm cả `id`
        this.editStatus = true; // Mở trạng thái chỉnh sửa
      } else {
        console.error('Province not found');
      }
    }
    

    // Close edit form
    goBack(): void {
      this.editStatus = false;
      this.editedProvince = null;
    }

    closeAddForm(): void {
      this.new = {
        id: 0,
        name: '',
        isActive: true
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
      console.log(this.searchTerm);
      
      if (this.searchTerm.trim() !== '') {
        this.provinceService.searchProvinces(this.searchTerm).subscribe(
          (provinces: Province[]) => {
            this.provinces = provinces;
            this.provinceDataSource.data = provinces; // Cập nhật dữ liệu cho bảng
          },
          (error) => {
            console.error('Error searching provinces:', error);
          }
        );
      } else {
        this.loadProvinces(); // Nếu từ khóa rỗng, tải lại toàn bộ dữ liệu
      }      
    }
    

    // Hàm gọi API để lấy tất cả người dùng
    loadProvinces(): void {
      this.provinceService.getProvinces().subscribe(
        (provinces: Province[]) => {
          this.provinces = provinces;
          this.provinceDataSource.data = this.provinces; // Cập nhật dữ liệu cho bảng
        },
        (error) => {
          console.error('Error fetching provinces:', error);
        }
      );
    }
    

    openAddForm(){
      this.addStatus = true;
    }

   // Lưu tỉnh sau khi chỉnh sửa
   onSave(): void {
    if (this.addStatus) {
      // Gọi API để thêm tỉnh mới
      this.provinceService.createProvince(this.new).subscribe(
        (newProvince: Province) => {
          this.provinces.push(newProvince);
          this.provinceDataSource.data = this.provinces; // Cập nhật lại dữ liệu bảng
          this.closeAddForm(); // Đóng form thêm
        },
        (error) => {
          console.error('Error creating province:', error);
        }
      );
    } else if (this.editStatus && this.editedProvince.id) {
      // Gọi API để cập nhật tỉnh
      console.log("hello");
      
      this.provinceService.updateProvince(this.editedProvince.id, this.editedProvince).subscribe(
        () => {
          const index = this.provinces.findIndex(p => p.id === this.editedProvince.id);
          if (index !== -1) {
            this.provinces[index] = { ...this.editedProvince };
            this.provinceDataSource.data = this.provinces; // Cập nhật lại dữ liệu bảng
          }
          this.goBack(); // Đóng form chỉnh sửa
        },
        (error) => {
          console.error('Error updating province:', error);
        }
      );
    }
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

    confirmDelete(): void {
      if (this.deleteProvinceId !== null) {
        this.provinceService.deleteProvince(this.deleteProvinceId).subscribe(
          () => {
            this.provinces = this.provinces.filter(p => p.id !== this.deleteProvinceId);
            this.provinceDataSource.data = this.provinces; // Cập nhật lại dữ liệu bảng
            this.closeDialog(); // Đóng hộp thoại
          },
          (error) => {
            console.error('Error deleting province:', error);
          }
        );
      }
    }
    
  }
