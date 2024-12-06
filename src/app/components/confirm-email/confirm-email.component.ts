import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.css'
})
export class ConfirmEmailComponent {
  emailText = ''

  constructor(private userService : UserService){}

  onSend(): void{
    this.userService.forgotPassword(this.emailText).subscribe({
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
