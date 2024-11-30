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
  waitingRestaurants: any[] = [];
  waitingRestaurantsCount: number = 0;
  isWaitingPopupVisible: boolean = false;

  // dropdown list multiple selections
  categories = [
    { id: '1', name: 'Italian' },
    { id: '2', name: 'Japanese' },
    { id: '3', name: 'Chinese' },
    { id: '4', name: 'Mexican' }
  ];
  selectedCategories: string[] = [];  // Lưu các giá trị đã chọn từ dropdown

  // phân trang
  dataSource = new MatTableDataSource<Restaurant>([]); 
  restaurants: Restaurant[] = [];
  pageSize = 10;
  displayedColumns: string[] = ['id', 'name', 'address', 'district', 'openedTime', 'closedTime', 'lowestCost', 'highestCost', 'phone', 'website', 'userId', 'action'];

  // chi tiết
  selectedWaitingRestaurant: any = null;

  // dialog confirm
  deleteRestaurantId: number | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort; // sort
  @ViewChild(MatSort) waitingRestaurantsSort!: MatSort; //waiting table
  @ViewChild('lockDialog') lockDialog!: any;

  constructor(private restaurantService: RestaurantService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.restaurantService.getRestaurants().subscribe((restaurants: Restaurant[]) => {
      this.restaurants = restaurants;
      this.dataSource.data = this.restaurants.filter(
        (restaurant) => restaurant.status === 'accepted'
      ); // lấy accepted restaurant

      this.waitingRestaurants = [
        { id: 1, userID: 101, name: 'Restaurant A', category: 'Italian', district: 'District 1', address: '123 Main St', phone: '123-456-7890', openedTime: '10:00 AM', closedTime: '10:00 PM' },
        { id: 2, userID: 102, name: 'Restaurant B', category: 'Chinese', district: 'District 2', address: '456 Oak Rd', phone: '987-654-3210', openedTime: '11:00 AM', closedTime: '11:00 PM' },
        { id: 3, userID: 103, name: 'Restaurant C', category: 'Indian', district: 'District 3', address: '789 Pine Ave', phone: '654-321-9870', openedTime: '9:00 AM', closedTime: '9:00 PM' },
        { id: 4, userID: 104, name: 'Restaurant D', category: 'Thai', district: 'District 4', address: '321 Elm St', phone: '321-654-9870', openedTime: '8:00 AM', closedTime: '8:00 PM' },
        { id: 5, userID: 105, name: 'Restaurant E', category: 'Mexican', district: 'District 5', address: '654 Birch Rd', phone: '555-234-5678', openedTime: '10:00 AM', closedTime: '11:00 PM' },
        { id: 6, userID: 106, name: 'Restaurant F', category: 'Japanese', district: 'District 6', address: '987 Cedar St', phone: '777-888-9999', openedTime: '12:00 PM', closedTime: '12:00 AM' },
        { id: 7, userID: 107, name: 'Restaurant G', category: 'French', district: 'District 7', address: '123 Maple Dr', phone: '444-555-6666', openedTime: '7:00 AM', closedTime: '7:00 PM' },
        { id: 8, userID: 108, name: 'Restaurant H', category: 'Vietnamese', district: 'District 8', address: '258 Oak St', phone: '888-999-1111', openedTime: '9:00 AM', closedTime: '10:00 PM' },
        { id: 9, userID: 109, name: 'Restaurant I', category: 'American', district: 'District 9', address: '369 Pine St', phone: '333-444-5555', openedTime: '6:00 AM', closedTime: '9:00 PM' },
        { id: 10, userID: 110, name: 'Restaurant J', category: 'Mediterranean', district: 'District 10', address: '147 Walnut Rd', phone: '222-333-4444', openedTime: '10:00 AM', closedTime: '10:00 PM' }
      ];
      
      this.waitingRestaurantsCount = this.waitingRestaurants.length;
      this.waitingRestaurantsDataSource.data = this.waitingRestaurants;

      // Lấy districtName cho từng nhà hàng sau khi nhận dữ liệu từ API
      this.restaurants.forEach(restaurant => {
        this.getDistrictName(restaurant.districtId).subscribe((districtName) => {
          this.districtNames[restaurant.id] = districtName;
        });
      });
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

  // có gì coi getDistrict
  getDistrictName(districtId: number): Observable<string> {
    return new Observable(observer => {
      this.restaurantService.getDistrictById(districtId).subscribe((district) => {
        if (district) {
          observer.next(district.name);  // Cập nhật districtName với tên của khu vực
        } else {
          observer.next('District not found');  // Xử lý khi không tìm thấy khu vực
        }
        observer.complete();
      });
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
  onSearch(): void {
    if (this.searchTerm.trim() !== '') {
      this.restaurantService.searchRestaurants(this.searchTerm).subscribe(
        (restaurants: Restaurant[]) => {
          this.restaurants = restaurants;
          this.dataSource.data = this.restaurants; // Cập nhật dữ liệu cho bảng
        },
        (error) => {
          console.error('Error searching restaurantS:', error);
        }
      );
    } else {
      // Nếu không có từ khóa tìm kiếm, làm mới bảng (chạy lại tìm kiếm với từ khóa rỗng)
      this.restaurantService.getRestaurants().subscribe(
        (restaurants: Restaurant[]) => {
          this.restaurants = restaurants;
          this.dataSource.data = this.restaurants; // Cập nhật dữ liệu cho bảng
        },
        (error) => {
          console.error('Error fetching restaurantS:', error);
        }
      );
    }
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

  openWaitingPopup(): void {
    // this.getWaitingRestaurants(); 
    this.isWaitingPopupVisible = true; 
  }

  onAccept(): void {
    const accepted = this.waitingRestaurants.filter((restaurant) => restaurant.selected);
    console.log('Accepted Restaurants:', accepted);
    // Xử lý logic thêm tại đây
  }
  
  onReject(): void {
    const rejected = this.waitingRestaurants.filter((restaurant) => restaurant.selected);
    console.log('Rejected Restaurants:', rejected);
    // Xử lý logic thêm tại đây
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
    this.selectedCategories = [];
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

  onDetailClick(detailRestaurant : any): void{
    console.log('Detail clicked for:', detailRestaurant);
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
}
