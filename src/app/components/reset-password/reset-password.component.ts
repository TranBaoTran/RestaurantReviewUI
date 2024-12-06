import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit{
  newPass = '';
  token: string = '';

  constructor(private route: ActivatedRoute, private userService : UserService) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.token = params.get('token') || '';
    });
  }

  onSend(): void{
    if (this.token && this.newPass) {
      this.userService.resetPassword(this.token, this.newPass).subscribe({
        next : (data : {message : string}) => {
          if(data){
            window.alert(data.message);
          }
        },
        error : (error) => {
          window.alert(error.error?.message);
        }
      })
    } 
  }
}
