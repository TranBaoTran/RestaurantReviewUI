import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, TemplateRef, ViewChild } from '@angular/core';
import { User } from '../../../models/admin/user.model';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIcon} from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../services/admin/user.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatIcon, MatSelectModule, FormsModule, MatSortModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})

export class UserManagementComponent implements AfterViewInit {
  editStatus = false;
  addStatus = false;
  showChangePasswordForm: boolean = false;
  changePwUser: User | null = null;
  oldPassword: string = '';
  newPassword: string = '';
  username: string = '';
  confirmPassword: string = '';  
  editedUser: User | null = null;

  newUser: User = {
    id: 0, 
    name: '',
    email: '',
    username: '',
    password: '',
    phone: '',
    isActive: true, 
    createdOn: new Date(), 
    avatarPath: '',
    publicAvatarId: 'default_avatar',
    roleId: 'AD',
  };

  selectedUserId?: number  | null = null;
  avatarFile: File | null = null;

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
  originalUser: any = { ...this.editedUser };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort; // sort
  @ViewChild('lockDialog') lockDialog!: TemplateRef<any>; 

  constructor(private userService: UserService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.onSearch();
    this.fetchUsers();
    this.selectedStatus = true;
    this.originalUser = { ...this.editedUser }; 
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

  // Mở form chỉnh sửa người dùng
  openEditForm(userId: number): void {
    this.editStatus = true;
    this.userService.getUserById(userId).subscribe(
      (user: User | null) => {
        if (user) {
          this.newUser = user;
          console.log('User data for editing:', user);
        } else {
          window.alert('User not found or inactive.');
          this.goBack(); // Reset to initial state if user not found
        }
      },
      error => {
        console.error('Error fetching user by ID:', error);
        window.alert('An error occurred while fetching user data.');
      }
    );
  }

  // Trở lại trạng thái ban đầu sau khi chỉnh sửa
  goBack(): void {
    this.editStatus = false;
    this.addStatus = false;
    this.showChangePasswordForm = false;
    this.editedUser = null;
    this.newUser = {
      id: 0, 
      name: '',
      email: '',
      username: '',
      password: '',
      phone: '',
      isActive: true, 
      createdOn: new Date(), 
      avatarPath: '',
      publicAvatarId: 'default_avatar',
      roleId: 'AD'
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
    this.userService.getUsers().subscribe(users => {
      this.users = users;
      this.dataSource.data = users;
      console.log('Dữ liệu người dùng:', this.users);
    });    
  }

  applyStatusFilter(): void {
    if (this.selectedStatus === true) {
      this.userService.getUsers().subscribe(users => {
        const filteredUsers = this.users.filter(user => user.isActive);
        this.dataSource.data = filteredUsers;  // Update table data with filtered users
        this.paginator.pageIndex = 0;  // Reset paginator on status filter change
      });
    } else if (this.selectedStatus === false) {
      this.userService.getLockedUsers().subscribe(users => {
        this.dataSource.data = users;
        this.paginator.pageIndex = 0;  // Reset paginator for locked users
      });
    }
  }
  

  // Khóa tài khoản người dùng
  lockUser(userId: number): void {
    this.userService.lockUser(userId).subscribe({
      next: (response) => {
        window.alert('User account locked successfully');
        // Reload data after locking
        this.ngOnInit();
      },
      error: (error) => {
        console.error('Error locking user:', error);
        window.alert('Error occurred while locking user');
      }
    });
  }

  // Mở khóa tài khoản người dùng
  unlockUser(userId: number): void {
    this.userService.unLockUser(userId).subscribe({
      next: (response) => {
        window.alert('User account unlock successfully');
        // Reload data after locking
        this.ngOnInit();
      },
      error: (error) => {
        console.error('Error unlocking user:', error);
        window.alert('Error occurred while locking user');
      }
    });
  }

  // Hàm gọi API để tìm kiếm người dùng
  onSearch(): void {
    if (this.query.trim().length > 0) {
      this.userService.searchUsers(this.query).subscribe(
        (users) => {
          // Filter users based on the selected status
          const filteredUsers = users.filter(user => 
            this.selectedStatus === null || 
            (user.isActive === this.selectedStatus)
          );
          this.users = filteredUsers; // Store filtered users
          this.dataSource.data = filteredUsers;  // Update the table with filtered data
        },
        (error) => {
          console.error('Error fetching users:', error);
        }
      );
    } else {
      this.fetchUsers();
    }
    console.log(this.users);
  }

  // Hàm gọi API để lấy tất cả người dùng
  loadUsers(): void {
    this.userService.getUsers().subscribe(
      (users: User[]) => {
        this.users = users;
        this.dataSource.data = this.users;
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  openAddUserForm(){
    this.addStatus = true;
  }

  onSave(){

  }

   // Mở form thay đổi mật khẩu
   openChangePasswordForm(userId: number): void {
    this.showChangePasswordForm = true;
    this.userService.getUserById(userId).subscribe(
      (user: User | null) => {
        if (user) {
          this.changePwUser = user;
          console.log('User data for editing:', user);
        } else {
          window.alert('User not found or inactive.');
          this.goBack(); // Reset to initial state if user not found
        }
      },
      error => {
        console.error('Error fetching user by ID:', error);
        window.alert('An error occurred while fetching user data.');
      }
    );
    // Lưu userId hoặc làm gì đó với userId nếu cần thiết
  }

  // Xử lý thay đổi mật khẩu
  onChangePassword(userId: number) {
    if (this.newPassword !== this.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }

    this.isFormChanged = false;
    this.userService.changePassword(userId, this.newPassword)
      .subscribe(
        () => {
          alert('Mật khẩu đã được thay đổi thành công');
          this.goBack();
          this.fetchUsers();
        },
        error => {
          alert('Có lỗi xảy ra khi thay đổi mật khẩu');
        }
      );
  }

  // Hàm xử lý khi chọn file ảnh
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.avatarFile = file; // Save the selected file
    }
  }

  // Hàm xử lý khi submit form
  onSubmit(): void {
    // Kiểm tra tính hợp lệ của email
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!this.newUser.email || !emailPattern.test(this.newUser.email)) {
      alert('Invalid email address!');
      return;
    }
  
    // Kiểm tra tính hợp lệ của số điện thoại
    const phonePattern = /^(03|05|07|08|09)[0-9]{8}$/;
    if (!this.newUser.phone || !phonePattern.test(this.newUser.phone)) {
      alert('Invalid phone number!');
      return;
    }
  
    // Kiểm tra nếu mật khẩu hợp lệ
    if (!this.newUser.password || this.newUser.password.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }
  
    // Thiết lập role của người dùng (có thể thay đổi nếu cần)
    this.newUser.roleId = 'AD'; // Default role ID for admin, adjust as needed
    console.log(this.editStatus);
    
    // Kiểm tra nếu đang tạo người dùng mới
    if (this.addStatus) {
      console.log(this.newUser);
      console.log(this.avatarFile);
      
      // Gọi API để tạo người dùng mới
      this.userService.createUser(this.newUser, this.avatarFile).subscribe(
        response => {
          alert('User created successfully!');
          this.goBack();
          this.loadUsers();
        },
        error => {
          console.error('Error creating user:', error);
          alert('Error creating user!');
        }
      );
    } else if (this.editStatus) {
      console.log("hello");
      
      // Gọi API để cập nhật người dùng
      this.userService.updateUser(this.newUser.id, this.newUser, this.avatarFile).subscribe(
        response => {
          alert('User updated successfully!');
          this.goBack();
          this.loadUsers();
        },
        error => {
          console.error('Error updating user:', error);
          alert('Error updating user!');
        }
      );
    }
  }
  

  // xem có change trong input thì xóa blur nút save
  onInputChange() {
    this.isFormChanged =
      this.newPassword !== this.originalPasswordValues.newPassword ||
      this.confirmPassword !== this.originalPasswordValues.confirmPassword;
  }

  checkFormChanged() {
    this.editChanged = JSON.stringify(this.editedUser) !== JSON.stringify(this.originalUser);
  }


  openLockDialog(user: any): void {
    const dialogRef = this.dialog.open(this.lockDialog, {
      data: user, // Truyền dữ liệu người dùng vào
      width: '300px',
    });
  
    // Khi dialog đóng, nhận kết quả trả về (true/false)
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (user.isActive) {
          console.log('User confirmed lock action:', user.id);
          this.lockUser(user.id); // Gọi hàm khóa nếu người dùng đang active
        } else {
          console.log('User confirmed unlock action:', user.id);
          this.unlockUser(user.id); // Gọi hàm mở khóa nếu người dùng đang không active
        }
      } else {
        console.log('User cancelled action:', user.id);
      }
    });
  }

}
