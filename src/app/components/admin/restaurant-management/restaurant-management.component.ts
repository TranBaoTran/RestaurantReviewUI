import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { RestaurantService } from '../../../services/restaurant.service';
import { Restaurant } from '../../../models/restaurant.model';
import { Province } from '../../../models/district.model';
import { forkJoin, map} from 'rxjs';
import { CurrencyFormatPipe } from '../../currency-format.pipe';

@Component({
  selector: 'app-restaurant-management',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatIcon, MatSelectModule, FormsModule, MatSortModule, RouterModule, CurrencyFormatPipe],
  templateUrl: './restaurant-management.component.html',
  styleUrl: './restaurant-management.component.css'
})
export class RestaurantManagementComponent implements AfterViewInit{
  province : Province[] = [];
  selectedImageUrl: string | null = null;

  //filter
  isDropdownVisible = false;
  currentSortOrder: string = 'asc';
  searchTerm: string = '';
  selectedCategory: string = '';

  // danh sách waiting restaurant
  waitingRestaurantsDataSource = new MatTableDataSource<any>();
  waitingRestaurants: any[] = [];
  waitingRestaurantsCount: number = 0;
  isWaitingPopupVisible: boolean = false;

  // phân trang
  dataSource = new MatTableDataSource<Restaurant>([]); 
  restaurants : Restaurant[] = []
  pageSize = 10;
  displayedColumns: string[] = ['id', 'name', 'address', 'district', 'phone', 'status', 'direct', 'action'];

  // chi tiết
  selectedWaitingRestaurant: any = null;

  // dialog confirm
  deleteRestaurantId: number | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort; // sort
  @ViewChild(MatSort) waitingRestaurantsSort!: MatSort; //waiting table
  @ViewChild('lockDialog') lockDialog!: any;

  constructor(private restaurantService : RestaurantService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.getAllRestaurant();
    this.getProvince();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.waitingRestaurantsDataSource.sort = this.waitingRestaurantsSort;
  }

  getAllRestaurant() {
    this.restaurantService.getAllRestaurant().subscribe({
      next: (data: Restaurant[]) => {
        if (data?.length) {
          // Create an array of observables for forkJoin
          const restaurantRequests = data.map((restaurant) => {
            const images$ = this.restaurantService.getImagesByRestaurantId(restaurant.id);
            const cate$ = this.restaurantService.getRestaurantCategoryByResId(restaurant.id);
            
            return forkJoin([images$, cate$]).pipe(
              map(([images, cate]) => ({
                ...restaurant,
                image: images,
                category: cate,
              }))
            );
          });
  
          // Execute all observables in parallel and handle the combined results
          forkJoin(restaurantRequests).subscribe({
            next: (restaurantsWithDetails) => {
              this.restaurants = restaurantsWithDetails; // Update restaurants array
              this.dataSource.data = this.restaurants; // Update the data source for display
              this.getWaitingRestaurants(); // Additional logic for processing waiting restaurants
            },
            error: (err) => {
              console.error('Failed to fetch detailed restaurant data:', err);
              window.alert('An error occurred while fetching restaurant details.');
            },
          });
        } else {
          console.warn('No restaurants found');
          this.dataSource.data = []; // Clear the data source if no restaurants are found
        }
      },
      error: (error) => {
        console.error('Failed to fetch restaurants:', error);
        window.alert('An error occurred while fetching the restaurants.');
      },
    });
  }
  

  getWaitingRestaurants(): void {
      this.waitingRestaurants = this.restaurants.filter(restaurant => restaurant.status === 'waiting');
      this.waitingRestaurantsCount = this.waitingRestaurants.length;
      this.waitingRestaurantsDataSource.data = this.waitingRestaurants;
  }

  getProvince(): void{
    this.restaurantService.getProvinces().subscribe({
      next : (data : Province[]) => {
        this.province = data;
      },
      error : (error) => {
        console.log("Error fetching province by id:" + error);
      }
    });
  }

  getDistrictAndProvinceName(districtID: number, provinces: Province[]): { districtName: string; provinceName: string } | null {
    for (const province of provinces) {
      const district = province.districts.find(d => d.id === districtID);
      if (district) {
        return {
          districtName: district.name,
          provinceName: province.name
        };
      }
    }
    return null;
  }

  updatePaginatedRestaurant(pageIndex: number): void {
    const startIndex = pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
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

  deleteRestaurant(restaurantId: number){
    
  }

  openWaitingPopup(): void {
    // this.getWaitingRestaurants(); 
    this.isWaitingPopupVisible = true; 
  }

  onAccept(): void {
    const accepted = this.waitingRestaurants.filter((restaurant) => restaurant.selected);
    if (accepted.length === 0) {
      window.alert("Bạn không chọn bất kì nhà hàng nào.")
      return;
    }
    const acceptRequests = accepted.map((restaurant) =>
      this.restaurantService.acceptRestaurant(restaurant.id)
    );
    forkJoin(acceptRequests).subscribe({
      next: (responses) => {
        window.alert("Chấp nhận nhà hàng thành công.");
        this.getAllRestaurant();
      },
      error: (err) => {
        console.error('Error during acceptance:', err);
        window.alert('An error occurred while accepting the restaurants.');
      }
    });
  }
  
  onReject(): void {
    const rejected = this.waitingRestaurants.filter((restaurant) => restaurant.selected);
    console.log('Rejected Restaurants:', rejected);
    if (rejected.length === 0) {
      window.alert("Bạn không chọn bất kì nhà hàng nào.")
      return;
    }
    const rejectRequests = rejected.map((restaurant) =>
      this.restaurantService.rejectRestaurant(restaurant.id)
    );
    forkJoin(rejectRequests).subscribe({
      next: (responses) => {
        window.alert("Từ chối nhà hàng thành công.");
        this.getAllRestaurant();
      },
      error: (err) => {
        console.error('Error during acceptance:', err);
        window.alert('An error occurred while accepting the restaurants.');
      }
    });
  }
  
  closeWaitingPopup(): void {
    // Truy cập vào mảng dữ liệu gốc
    const data = this.waitingRestaurantsDataSource.data;

    // Đặt tất cả các checkbox về unchecked
    data.forEach((restaurant: any) => {
      restaurant.selected = false;
    });

    // Gán lại mảng dữ liệu đã cập nhật cho MatTableDataSource
    this.waitingRestaurantsDataSource.data = data;
    this.isWaitingPopupVisible = false; 
  }

  toggleSelectAll(event: any): void {
    const checked = event.target.checked;
    this.waitingRestaurants.forEach((restaurant) => (restaurant.selected = checked));
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
    return this.waitingRestaurantsDataSource.data.every(item => item.selected);
  }

  onDetailClick(detailRestaurant: any, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedWaitingRestaurant = detailRestaurant;
}

  closeDetailBox(): void {
    this.selectedWaitingRestaurant = null;
  }

  openDeleteDialog(provinceId: number): void {
    if (provinceId) {
      this.deleteRestaurantId = provinceId;
      this.dialog.open(this.lockDialog);
    }
  }

  closeDialog(): void {
    this.dialog.closeAll(); 
  }

  confirmDelete(): void{
    if (this.deleteRestaurantId !== null && this.deleteRestaurantId !== undefined) { 
      const provinceId = this.deleteRestaurantId;

      console.log(provinceId)
      this.closeDialog();

      // cần LOAD LẠI TABLE
    }
  }

  openImage(imageUrl: string): void {
    this.selectedImageUrl = imageUrl;
  }

  // Method to close the modal
  closeModal(): void {
    this.selectedImageUrl = null;
  }
}
