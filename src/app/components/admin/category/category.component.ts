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
    this.loadData();
    this.onSearch();
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
    const category = this.categories.find((c) => c.id === categoryId);
    if (category) {
      this.editedCategory = { ...category }; // Copy đối tượng để không thay đổi dữ liệu gốc
      console.log("Editing category:", this.editedCategory); // Kiểm tra xem có id hay không
      this.editStatus = true; // Bật trạng thái chỉnh sửa
    } else {
      console.error(`Category with ID ${categoryId} not found.`);
    }
  }
  

  // Close edit form
  goBack(): void {
    this.editStatus = false;
    this.editedCategory = null;
  }
  
  closeAddForm(): void {
    this.addStatus = false;
    this.new = { name: '' };
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
    console.log(this.searchTerm);
    
    if (this.searchTerm.trim() !== '') {
      this.categoryService.searchCategories(this.searchTerm).subscribe(
        (categories: Category[]) => {
          console.log('Search results:', categories);
          this.categories = categories;
          this.dataSource.data = categories;
        },
        error => {
          console.error('Error searching categories:', error);
        }
      );
    } else {
      this.loadData(); // Nếu không nhập từ khóa, tải lại tất cả dữ liệu
    }
  }
  

  // Hàm gọi API để lấy tất cả người dùng
  loadData(): void {
    this.categoryService.getCategories().subscribe(
      (categories: Category[]) => {
        console.log('Categories loaded:', categories);
        this.categories = categories;
        this.dataSource.data = categories; // Cập nhật dữ liệu cho bảng
      },
      error => {
        console.error('Error loading categories:', error);
      }
    );
  }
  

  openAddForm(){
    this.addStatus = true;
  }

  onSave(): void {
    if (this.editStatus) {
      console.log(this.editedCategory.id);
      // Nếu đang trong chế độ chỉnh sửa, gọi API update
      const updatedCategory: Category = {
        id: this.editedCategory.id,
        name: this.editedCategory.name,
        isActive: true // Hoặc trạng thái khác tùy theo logic của bạn
      };
  
      this.categoryService.updateCategory(updatedCategory.id, updatedCategory).subscribe(
        () => {
          console.log('Category updated successfully:', updatedCategory);
          // Cập nhật dữ liệu trên giao diện
          const index = this.categories.findIndex(cat => cat.id === updatedCategory.id);
          if (index !== -1) {
            this.categories[index] = updatedCategory;
          }
          this.dataSource.data = this.categories;
          this.goBack(); // Đóng form chỉnh sửa
        },
        error => {
          console.error('Error updating category:', error);
        }
      );
    } else if (this.addStatus) {
      // Nếu đang trong chế độ thêm mới, gọi API create
      const newCategory: Category = {
        id: 0, // Backend sẽ tự tạo ID
        name: this.new.name,
        isActive: true
      };
  
      this.categoryService.createCategory(newCategory).subscribe(
        (createdCategory: Category) => {
          console.log('Category created successfully:', createdCategory);
          // Thêm dữ liệu vào danh sách hiện tại
          this.categories.push(createdCategory);
          this.dataSource.data = this.categories;
          this.closeAddForm(); // Đóng form thêm mới
        },
        error => {
          console.error('Error creating category:', error);
        }
      );
    }
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

  confirmDelete(): void {
    if (this.deletecategoryId !== null && this.deletecategoryId !== undefined) {
      const categoryId = this.deletecategoryId;
  
      this.categoryService.deleteCategory(categoryId).subscribe(
        () => {
          console.log(`Category with ID ${categoryId} deleted successfully.`);
          // Xóa dữ liệu khỏi danh sách
          this.categories = this.categories.filter(cat => cat.id !== categoryId);
          this.dataSource.data = this.categories;
          this.closeDialog(); // Đóng dialog sau khi xóa
        },
        error => {
          console.error('Error deleting category:', error);
        }
      );
    }
  }
  
}
