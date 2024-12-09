import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginResponse, Signup } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { SecureStorageService } from '../../services/secure-storage.service';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent implements OnInit{
  user : Signup = {
    username: '',
    email: '',
    password: '',
    phone: '',
    name: ''
  };

  constructor(private userService : UserService, private secureStorageService : SecureStorageService, private router : Router) {}

  ngOnInit(): void {
    
  }
  
  signUpUser(): void{
    this.user.username = this.user.username.trim();
    this.user.email = this.user.email.trim();
    this.user.name = this.user.name.trim();
    this.user.phone = this.user.phone.trim();
    this.userService.userSignUp(this.user).subscribe({
      next: (data : LoginResponse) => {
        if(data && data.token){
          const decodedToken = jwtDecode<any>(data.token);
          this.secureStorageService.setToken(data.token);
          this.secureStorageService.setUserId(decodedToken.UserId);
          this.secureStorageService.setRole(decodedToken.RoleId);
          this.router.navigate(['']);
        }else{
          window.alert("Signup Error: Missing token.");
        }
      },
      error: (error) => {
        window.alert(error.error?.message);
      }, 
      complete: () => {
        window.alert("Đăng ký thành công!");
      },
    })
  }
}
