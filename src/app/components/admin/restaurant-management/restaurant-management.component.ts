import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Restaurant } from '../../../models/admin/restaurant.model';
import { Observable } from 'rxjs';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { RestaurantService } from '../../../services/admin/restaurant.service';
import { MatDialog } from '@angular/material/dialog';
import { CategoryService } from '../../../services/admin/category.service';
import { Category } from '../../../models/admin/category.model';

@Component({
  selector: 'app-restaurant-management',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatIcon, MatSelectModule, FormsModule, MatSortModule],
  templateUrl: './restaurant-management.component.html',
  styleUrl: './restaurant-management.component.css'
})
export class RestaurantManagementComponent implements AfterViewInit{
  districtNames: { [key: number]: string } = {};

  //filter
  isDropdownVisible = false;
  currentSortOrder: string = 'asc';
  searchTerm: string = '';
  selectedCategory: string = '';

  // danh sách waiting restaurant
  waitingRestaurantsDataSource = new MatTableDataSource<any>();
  waitingRestaurants: Restaurant[] = [];
  waitingRestaurantsCount: number = 0;
  isWaitingPopupVisible: boolean = false;
  selectedRestaurants: number[] = []; // To store selected IDs

  selectedCategories: string[] = [];  // Lưu các giá trị đã chọn từ dropdown
  selectedCategoriesId: number[] = [];  // Lưu các giá trị đã chọn từ dropdown

  // phân trang
  dataSource = new MatTableDataSource<Restaurant>([]); 
  restaurants: Restaurant[] = [];
  categories: Category[] = [];
  pageSize = 10;
  displayedColumns: string[] = ['id', 'name', 'address', 'district', 'openedTime', 'closedTime', 'lowestCost', 'highestCost', 'phone', 'website', 'userId', 'action'];

  // chi tiết
  selectedWaitingRestaurant: any = null;

  // dialog confirm
  deleteRestaurantId: number = -1;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort; // sort
  @ViewChild(MatSort) waitingRestaurantsSort!: MatSort; //waiting table
  @ViewChild('lockDialog') lockDialog!: any;

  constructor(private restaurantService: RestaurantService, private categoryService: CategoryService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.restaurantService.getRestaurants().subscribe((restaurants: Restaurant[]) => {
      this.loadRestaurants();
      this.loadWaitingRes();      
      this.getCateogry();
      this.searchRestaurants();
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;  // Bind paginator to the table
    this.dataSource.sort = this.sort;
    this.waitingRestaurantsDataSource.sort = this.waitingRestaurantsSort;
  }

  getWaitingRestaurants(): void {
    this.restaurantService.getRestaurants().subscribe((restaurants: Restaurant[]) => {
      // Filter restaurants by status 'waiting'
      this.waitingRestaurants = restaurants.filter(restaurant => restaurant.status === 'waiting');
      this.waitingRestaurantsCount = this.waitingRestaurants.length; // Update the count
      console.log('Waiting restaurants:', this.waitingRestaurants);
    });
  }


  getCateogry(): void{
    this.categoryService.getCategories().subscribe((categories: Category[]) => {
      // Filter restaurants by status 'waiting'
      this.categories = categories;
      console.log('Waiting restaurants:', this.categories);
    });  
  }

  updatePaginatedRestaurant(pageIndex: number): void {
    const startIndex = pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.dataSource.data = this.restaurants.filter(
      (restaurant) => restaurant.status === 'accepted'
    );
    this.dataSource.data = this.restaurants.slice(startIndex, endIndex);
  }
  
  goBack(): void {

  }

  // Tìm kiếm người dùng theo tên
  applySearch(): void {
    const filteredRestaurant = this.restaurants.filter(restaurant => 
      restaurant.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.dataSource.data = filteredRestaurant;
  }

  // tim kiem theo category
  applyCategoryFilter(): void {

  }
  
  // Hàm gọi API để tìm kiếm 
  searchRestaurants(): void {
    if (this.searchTerm.trim().length > 0) {
      this.restaurantService.searchRestaurants(this.searchTerm).subscribe(
        (restaurants) => {
          const filteredRess = restaurants.filter(res => 
            res.status === 'accpected'
          );
          this.restaurants = filteredRess; // Store the restaurants directly
          this.dataSource.data = restaurants;  // Update the table with fetched data
        },
        (error) => {
          console.error('Error fetching restaurants:', error);
        }
      );
    } else {
      this.loadRestaurants();
    }
    console.log(this.restaurants);
  }
  
  searchWaitingRestaurants(): void {
    if (this.searchTerm.trim().length > 0) {
      this.restaurantService.searchRestaurants(this.searchTerm).subscribe(
        (restaurants) => {
          const filteredRess = restaurants.filter(res => 
            res.status === 'waiting'
          );
          this.waitingRestaurants = filteredRess; // Store the restaurants directly
          this.waitingRestaurantsDataSource.data = restaurants;  // Update the table with fetched data
        },
        (error) => {
          console.error('Error fetching restaurants:', error);
        }
      );
    } else {
      this.loadWaitingRes();
    }
    console.log(this.restaurants);
  }

  searchWaitingRestaurantsCombined(): void {
    const searchTerm = this.searchTerm.trim();
    const categoryIds = this.selectedCategoriesId;
  
    // Gọi API nếu có ít nhất một tiêu chí tìm kiếm
    if (searchTerm || (categoryIds && categoryIds.length > 0)) {
      this.restaurantService.searchRestaurantsCombined(searchTerm, categoryIds).subscribe(
        (restaurants) => {
          this.waitingRestaurants = restaurants; // Lưu danh sách nhà hàng
          this.waitingRestaurantsDataSource.data = restaurants; // Cập nhật table
        },
        (error) => {
          console.error('Error fetching restaurants:', error);
        }
      );
    } else {
      console.warn('No search term or categories selected.');
      this.loadWaitingRes(); // Tải toàn bộ dữ liệu nếu không có tiêu chí
    }
    console.log({ searchTerm, categoryIds });
  }
  
  

  onSearchWaiting(): void {
    this.searchWaitingRestaurantsCombined();
  }
  onSearch(): void {
    this.searchRestaurants();
  }

  onCategoryChange(): void {
    this.searchWaitingRestaurantsCombined();
  }

  // Hàm gọi API để lấy tất cả người dùng
  loadRestaurants(): void {
    this.restaurantService.getRestaurants().subscribe(
      (restaurants: Restaurant[]) => {
        this.restaurants = restaurants;
        this.dataSource.data = this.restaurants;
      },
      (error) => {
        console.error('Error fetching restaurantS:', error);
      }
    );
  }
  deleteRestaurant(restaurantId: number){
  }

 loadWaitingRes(): void {
  this.restaurantService.getWaitingRestaurants().subscribe(
    (waitingRestaurants: Restaurant[]) => {
      this.waitingRestaurants = waitingRestaurants;
      this.waitingRestaurantsDataSource.data = this.waitingRestaurants;
      this.waitingRestaurantsCount = this.waitingRestaurants.length;
      console.log("aaaaaaaa",this.waitingRestaurants);
      
    },
    (error) => {
      console.error('Error fetching restaurantS:', error);
    }
  );
 }

  openWaitingPopup(): void {
    // this.getWaitingRestaurants(); 
    this.isWaitingPopupVisible = true; 
    this.loadWaitingRes();
  }

  onAccept() {
    // Lọc ra tất cả các nhà hàng đã được chọn
    const selectedRestaurantIds = this.waitingRestaurants
      .filter(restaurant => restaurant.selected)  // Chỉ lấy nhà hàng có selected = true
      .map(restaurant => restaurant.id);  // Lấy ra ID của các nhà hàng đã chọn
  
    // Gọi API để chấp nhận từng nhà hàng
    selectedRestaurantIds.forEach(id => {
      this.restaurantService.acceptRestaurant(id).subscribe(
        () => {
          console.log(`Restaurant with ID ${id} accepted`);
          this.loadWaitingRes();
          this.loadRestaurants();
          // this.closeWaitingPopup();
        },
        error => {
          console.error('Error accepting restaurant', error);
        }
      );
    });
  }
  
  
  
  onReject(): void {
    const selectedRestaurantIds = this.waitingRestaurants
      .filter(restaurant => restaurant.selected)  // Chỉ lấy nhà hàng có selected = true
      .map(restaurant => restaurant.id);  // Lấy ra ID của các nhà hàng đã chọn
  
    // Gọi API để chấp nhận từng nhà hàng
    selectedRestaurantIds.forEach(id => {
      this.restaurantService.rejectRestaurant(id).subscribe(
        () => {
          console.log(`Restaurant with ID ${id} rejected`);
          this.loadWaitingRes();
          this.loadRestaurants();
          // this.closeWaitingPopup();
        },
        error => {
          console.error('Error accepting restaurant', error);
        }
      );
    });
  }
  
  closeWaitingPopup(): void {
    // Truy cập vào mảng dữ liệu gốc
    const data = this.waitingRestaurantsDataSource.data;

    // Đặt tất cả các checkbox về unchecked
    console.log("abc",data);
    
    data.forEach((restaurant: any) => {
      restaurant.selected = false;
    });

    // Gán lại mảng dữ liệu đã cập nhật cho MatTableDataSource
    this.waitingRestaurantsDataSource.data = data;
    this.selectedCategories = [];
    this.selectedCategoriesId = [];
    this.isWaitingPopupVisible = false; 
  }

  toggleSelectAll(event: any): void {
    const isChecked = event.target.checked;
    this.waitingRestaurants.forEach((restaurant) => {
      restaurant.selected = isChecked;
    });
  }

   // Hàm xử lý click vào dòng
   onRowClick(row: any): void {
    row.selected = !row.selected;  // Chuyển đổi trạng thái 'selected' khi click vào dòng
    console.log(row);  // In ra row để kiểm tra trạng thái
  }

  isSelected(): boolean {
    return this.waitingRestaurantsDataSource.data.some(item => item.selected);
  }

  // Hàm kiểm tra xem tất cả các hàng đã được chọn chưa
  isAllSelected(): boolean {
    return this.waitingRestaurants.every((restaurant) => restaurant.selected);
  }

  onDetailClick(detailRestaurant : any): void{
    console.log('Detail clicked for:', detailRestaurant);
    this.selectedWaitingRestaurant = detailRestaurant;
  }

  closeDetailBox(): void {
    this.selectedWaitingRestaurant = null;
  }

  openDeleteDialog(resId: number): void {
    if (resId) {
      this.deleteRestaurantId = resId;
      this.dialog.open(this.lockDialog);
    }
  }

  closeDialog(): void {
    this.dialog.closeAll(); 
  }

  confirmDelete(): void{
    this.restaurantService.deleteRestaurant(this.deleteRestaurantId).subscribe(
      () => {
        console.log(`Restaurant with ID ${this.deleteRestaurantId} deleted`);
        this.loadWaitingRes();
        this.loadRestaurants();
        // this.closeWaitingPopup();
      },
      error => {
        console.error('Error deleting restaurant', error);
      }
    );
  }
}
