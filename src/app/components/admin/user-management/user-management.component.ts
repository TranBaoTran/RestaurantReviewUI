var google : any;

import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, TemplateRef, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIcon} from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router';
import { SecureStorageService } from '../../../services/secure-storage.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatIcon, MatSelectModule, FormsModule, MatSortModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})

export class UserManagementComponent implements AfterViewInit {
  addStatus = false;
  isLoading  = false;
  newUser : any = {
    name : '',
    email : '',
    username : '',
    password : '',
    phone : '',
    avatar : null,
  };

  selectedUserId = {
    id : -1,
    isActive : true
  };

  //filter
  isDropdownVisible = false;
  currentSortOrder: string = 'asc';
  query: string = '';
  selectedStatus: boolean | null = null;

  // phân trang
  dataSource = new MatTableDataSource<User>([]);  // MatTableDataSource simplifies pagination
  users: User[] = [];
  paginatedUsers: User[] = [];
  pageSize = 10;

  // Blur save button
  originalPasswordValues: { newPassword: string; confirmPassword: string } = {
    newPassword: '',
    confirmPassword: '',
  };
  isFormChanged: boolean = false;
  editChanged: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort; // sort
  @ViewChild('lockDialog') lockDialog!: TemplateRef<any>; 

  constructor(private userService: UserService, private dialog: MatDialog, private secureStorageService : SecureStorageService, private router : Router) {}

  ngOnInit(): void {
    this.fetchUsers();
    this.selectedStatus = true;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;  // Bind paginator to the table
    this.dataSource.sort = this.sort;
  }

  updatePaginatedUsers(pageIndex: number): void {
    const startIndex = pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.dataSource.data = this.users.slice(startIndex, endIndex);
  }

  // Trở lại trạng thái ban đầu sau khi chỉnh sửa
  goBack(): void {
    this.addStatus = false;
    this.newUser = {
      name : '',
      email : '',
      username : '',
      password : '',
      phone : '',
      createdOn : new Date(),
      avatar : null
    };
  }

  // Tìm kiếm người dùng theo tên
  applySearch(): void {
    const filteredUsers = this.users.filter(user => 
      user.name.toLowerCase().includes(this.query.toLowerCase())
    );
    this.dataSource.data = filteredUsers;
  }

  fetchUsers(): void {
    this.userService.getAllUser().subscribe(users => {
      this.users = users;
      this.dataSource.data = users;
    });    
  }

  applyStatusFilter(): void {
    const filteredUsers = this.users.filter(u => u.isActive == this.selectedStatus);
    this.dataSource.data = filteredUsers
  }
  

  // Khóa tài khoản người dùng
  lockUser(userId: number): void {
    this.userService.lockUser(userId).subscribe({
      next: (data : {message : string}) => {
        window.alert(data.message);
        this.fetchUsers();
      },
      error: (err) => {
        if (err.status === 401) {
          window.alert("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại!");
          this.secureStorageService.clearStorage();
          google.accounts.id.disableAutoSelect();
          this.router.navigate(['/login']);
        } else {
          window.alert(err.error?.message);
        }      
      }
    });
  }

  // Mở khóa tài khoản người dùng
  unlockUser(userId: number): void {
    this.userService.unlockUser(userId).subscribe({
      next: (data : {message : string}) => {
        window.alert(data.message);
        this.fetchUsers();
      },
      error: (err) => {
        if (err.status === 401) {
          window.alert("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại!");
          this.secureStorageService.clearStorage();
          google.accounts.id.disableAutoSelect();
          this.router.navigate(['/login']);
        } else {
          window.alert(err.error?.message);
        }  
      }
    });
  }

  openAddUserForm(){
    this.addStatus = true;
  }

  onSave(){

  }

  // Hàm xử lý khi chọn file ảnh
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.newUser.avatar = file; 
    }
  }

  // Hàm xử lý khi submit form
  onSubmit(): void {
    if(this.newUser.avatar == null){
      alert("Vui lòng chọn hình đại diện.")
      return;
    }
    this.isLoading = true;
  
    const formData = new FormData();
    formData.append('Email', this.newUser.email);
    formData.append('Name', this.newUser.name);
    formData.append('Username', this.newUser.username);
    formData.append('Password', this.newUser.password);
    formData.append('Phone', this.newUser.phone);
    formData.append('Avatar', this.newUser.avatar, this.newUser.avatar.name); 

    this.userService.addNewAdmin(formData).subscribe({
      next: (data : {message : string}) => {
        this.isLoading = false;
        window.alert(data.message);
        this.fetchUsers();
        this.goBack();
      },
      error: (error) => {
        this.isLoading = false;
        window.alert(error.error?.message);
      }
    })
  }

  openDialog(userId: number, userIsActive : boolean): void {
    if (!userId) {
      console.error("Invalid user ID:", userId);
      return;
    }
    this.selectedUserId = {
      id : userId,
      isActive : userIsActive
    };
    this.dialog.open(this.lockDialog);

  }

  closeDialog(): void {
    this.dialog.closeAll();
    this.selectedUserId = {
      id : -1,
      isActive : true
    };
  }

  confirmLock(): void{
    if (this.selectedUserId.id != -1) { 
      const userId = this.selectedUserId.id;
      if(this.selectedUserId.isActive){
        this.lockUser(userId);
      }else{
        this.unlockUser(userId);
      }
      this.closeDialog();
    }
  }
}
