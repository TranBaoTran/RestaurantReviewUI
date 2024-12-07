var google : any

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
import { RestaurantService } from '../../../services/restaurant.service';
import { Router } from '@angular/router';
import { SecureStorageService } from '../../../services/secure-storage.service';

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
    id: -1,
    name: ''
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

  constructor(private categoryService: CategoryService, private dialog: MatDialog, private restaurantService : RestaurantService, private secureStorageService : SecureStorageService, private router : Router) {}

  ngOnInit(): void {
    this.getCategories();
  }

  getCategories(): void{
    this.restaurantService.getCategories().subscribe({
      next: (data : Category[]) => {
        if(data){
          this.categories = data;
          this.dataSource.data = this.categories;
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
      this.editedCategory = {
        id: category.id,
        name: category.name
      };
      this.editStatus = true; 
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
  
  openAddForm(){
    this.addStatus = true;
  }

  onSave(){
    this.categoryService.createCategory({ name : this.new.name.trim(), isActive : true}).subscribe({
      next : (data : {message : string}) => {
        if(data){
          window.alert(data.message);
          this.getCategories();
          this.addStatus = false;
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

  updateCategory(){
    this.categoryService.updateCategory(this.editedCategory.id, this.editedCategory.name).subscribe({
      next : (data : {message : string}) => {
        if(data){
          window.alert(data.message);
          this.getCategories();
          this.editStatus = false;
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

      this.categoryService.deleteCategory(categoryId).subscribe({
        next : (data : {message : string}) => {
          if(data){
            window.alert(data.message);
            this.getCategories();
            this.closeDialog();
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
  }
}
