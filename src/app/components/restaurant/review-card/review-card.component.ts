import { Component, Input, OnInit } from '@angular/core';
import { Review } from '../../../models/review.model';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { MdbAccordionModule } from 'mdb-angular-ui-kit/accordion';
import { RatingStarComponent } from "../rating-star/rating-star.component";

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [MdbAccordionModule, RatingStarComponent],
  templateUrl: './review-card.component.html',
  styleUrl: './review-card.component.css'
})
export class ReviewCardComponent implements OnInit{
  @Input({required: true}) Review! : Review
  userName: string = '';
  userAvatar: string = '';
  year: number = 0;
  month: number = 0;
  day: number = 0;

  constructor( private userService : UserService){
    
  }
  ngOnInit(): void {
    this.loadUserInfo(this.Review.userId);
    this.extractDateParts(this.Review.createdOn);
  }

  loadUserInfo(userId : number){
    this.userService.getUserById(userId).subscribe({
      next: (data : User) => {
        this.userAvatar = data.avatarPath;
        this.userName = data.name;
      },
      error: (err) => {
        console.log("Cant not get the user's Name and Avatar path" + err) ;
      }
    })
  }

  extractDateParts(dateString: string) {
    const datePart = dateString.split('T')[0]; // Lấy phần ngày từ chuỗi (phần trước chữ 'T')
    const [year, month, day] = datePart.split('-').map(Number); // Tách năm, tháng, ngày và chuyển thành số
    this.day = day;
    this.year = year;
    this.month = month
  }


}
