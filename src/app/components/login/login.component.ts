import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Login, LoginResponse } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  login : Login = {
    username : '',
    password : ''
  }

  constructor(private userService: UserService, private router : Router){}

  ngOnInit(): void {
    
  }

  logInUser(): void{
    this.userService.userLogIn(this.login).subscribe({
      next: (data: LoginResponse) => {
        if (data && data.token) {
          const decodedToken = jwtDecode<any>(data.token);
          localStorage.setItem('token', data.token);
          localStorage.setItem('userid', decodedToken.UserId);
          localStorage.setItem('roleid', decodedToken.RoleId);
          this.router.navigate(['']);
        } else {
          window.alert("Login Error: Missing token.");
        }
      },
      error: (error) => {
        if (error.status === 401) {
          window.alert("Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng thử lại!");
        } else {
          window.alert(`An error occurred: ${error.message}`);
        }
        console.error('Error:', error);
      },
      complete: () => {
        window.alert("Đăng nhập thành công!");
      },
    });
    
  }
}
