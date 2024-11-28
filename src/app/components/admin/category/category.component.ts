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
import { Category } from '../../../models/admin/category.model';
import { CategoryService } from '../../../services/admin/category.service';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatIcon, MatSelectModule, FormsModule, MatSortModule],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent implements AfterViewInit{
  // add edit
  editStatus = false;
  addStatus = false;
  editedCategory: any = {
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
  dataSource = new MatTableDataSource<Province>([]);
  categories: Category[] = [];
  pageSize = 10;

  // dialog confirm
  deletecategoryId: number | null = null;


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort; 
  @ViewChild('lockDialog') lockDialog!: any;

  constructor(private categoryService: CategoryService, private dialog: MatDialog) {}

  ngOnInit(): void {
    // this.categorieservice.getDistricts().subscribe((districts: District[]) => {
    //   this.districts = districts;
    //   this.dataSource.data = districts;  // Set the data for the table
    //   console.log('Dữ liệu người dùng:', this.districts);
    // });
    // this.selectedStatus = true;
    this.categories = [
      { id: 1, name: 'Hải sản', isActive: true },
      { id: 2, name: 'Bình dân', isActive: true },
      { id: 3, name: 'Món Nhật', isActive: true },
      { id: 4, name: 'Ăn nhẹ/Tráng miệng', isActive: true },
      { id: 5, name: 'Đặc sản', isActive: true },
      { id: 6, name: 'Buffet', isActive: true },
      { id: 7, name: 'Quán nhậu', isActive: true },
      { id: 8, name: 'Tiệc tùng', isActive: true },
      { id: 9, name: 'Ăn chay', isActive: true },
      { id: 10, name: 'Sang trọng', isActive: true },
      { id: 11, name: 'Món Hàn', isActive: true },
    ];
    this.dataSource.data = this.categories;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;  // Bind paginator to the table
    this.dataSource.sort = this.sort;
  }

  updatePaginatedCategories(pageIndex: number): void {
    const startIndex = pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.dataSource.data = this.categories.slice(startIndex, endIndex);
  }

  // Mở form chỉnh sửa người dùng
  openEditForm(categoryId: number): void {
    const category = this.categories.find((d) => d.id === categoryId);
    if (category) {
    // Gán giá trị của category được chọn vào editedCategory
    this.editedCategory = {
      name: category.name,
    };
    this.editStatus = true; // Bật trạng thái chỉnh sửa
    }
  }

  // Close edit form
  goBack(): void {
    this.editStatus = false;
    this.editedCategory = null;
  }

  closeAddForm(): void {
    this.new = {
      name: '',
    };
    this.addStatus = false;
  }
  

  // Tìm kiếm người dùng theo tên
  applySearch(): void {
    const filterCategory = this.categories.filter(category => 
      category.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.dataSource.data = filterCategory;
  }


  // Hàm gọi API để tìm kiếm 
  onSearch(): void {
    // if (this.searchTerm.trim() !== '') {
    //   this.categorieservice.searchcategories(this.searchTerm).subscribe(
    //     (categories: Province[]) => {
    //       this.categories = categories;
    //       this.dataSource.data = this.categories; // Cập nhật dữ liệu cho bảng
    //     },
    //     (error) => {
    //       console.error('Error searching categories:', error);
    //     }
    //   );
    // } else {
    //   // Nếu không có từ khóa tìm kiếm, làm mới bảng (chạy lại tìm kiếm với từ khóa rỗng)
    //   this.categorieservice.getcategories().subscribe(
    //     (categories: Province[]) => {
    //       this.categories = categories;
    //       this.dataSource.data = this.categories; // Cập nhật dữ liệu cho bảng
    //     },
    //     (error) => {
    //       console.error('Error fetching categories:', error);
    //     }
    //   );
    // }
  }

  // Hàm gọi API để lấy tất cả người dùng
  loadProvince(): void {
    // this.categorieservice.getDistricts().subscribe(
    //   (districts: District[]) => {
    //     this.districts = districts;
    //     this.dataSource.data = this.districts;
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
    console.log('Saved District:', this.editedCategory);
    // Thực hiện lưu thông tin ở đây
  }

  // Method to open the lock dialog for a specific district
  openDeleteDialog(categoryId: number): void {
    if (categoryId) {
      this.deletecategoryId = categoryId;
      this.dialog.open(this.lockDialog);
    }
  }

  closeDialog(): void {
    this.dialog.closeAll(); 
  }

  confirmDelete(): void{
    if (this.deletecategoryId !== null && this.deletecategoryId !== undefined) { 
      const categoryId = this.deletecategoryId;

      console.log(categoryId)
      this.closeDialog();

      // cần LOAD LẠI TABLE
    }
  }
}
