declare var google : any;

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Login, LoginResponse } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { SecureStorageService } from '../../services/secure-storage.service';

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

  constructor(private userService: UserService, private router : Router, private secureStorageService : SecureStorageService){}

  ngOnInit(): void {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      google.accounts.id.initialize({
        client_id: '921120116070-li1ltfuf0f9sp14p7s10nqlejg93bofi.apps.googleusercontent.com',
        callback: (res: any) => this.handleRespond(res)
      });

      google.accounts.id.renderButton(
        document.getElementById('google-login-button') as HTMLElement,
        {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          logo_alignment: 'left'
        }
      );
    } else {
      console.error('Google Identity script not loaded or google object is undefined.');
    }
  }

  handleRespond(res : any){
    const token = res.credential; 
    if(token){
      this.userService.userGGLogin({ idToken: token }).subscribe({
        next : (data : LoginResponse) => {
          if (data && data.token) {
            const decodedToken = jwtDecode<any>(data.token);
            this.secureStorageService.setToken(data.token);
            this.secureStorageService.setUserId(decodedToken.UserId);
            this.secureStorageService.setRole(decodedToken.RoleId);
            this.router.navigate(['']);
          } else {
            window.alert("Login Error: Missing token.");
          }
        },
        error: (error) => {
          console.error('Error:', error);
        }
      })
    }else{
      console.error("Error : Cannot get token");
    }
  }

  logInUser(): void{
    this.userService.userLogIn(this.login).subscribe({
      next: (data: LoginResponse) => {
        if (data && data.token) {
          const decodedToken = jwtDecode<any>(data.token);
          this.secureStorageService.setToken(data.token);
          this.secureStorageService.setUserId(decodedToken.UserId);
          this.secureStorageService.setRole(decodedToken.RoleId);
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
