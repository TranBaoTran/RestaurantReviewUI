import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Review, VoteReview } from '../../../models/review.model';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { MdbAccordionModule } from 'mdb-angular-ui-kit/accordion';
import { RatingStarComponent } from "../rating-star/rating-star.component";
import { SecureStorageService } from '../../../services/secure-storage.service';
import { CommonModule } from '@angular/common';
import { ReviewService } from '../../../services/review.service';

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [MdbAccordionModule, RatingStarComponent, CommonModule],
  templateUrl: './review-card.component.html',
  styleUrl: './review-card.component.css'
})
export class ReviewCardComponent implements OnInit{
  @Input({required: true}) Review! : Review
  @Output() reviewDeleted = new EventEmitter<number>();
  userName: string = '';
  userAvatar: string = '';
  year: number = 0;
  month: number = 0;
  day: number = 0;
  userid : number = -1;
  hasVoted : VoteReview[] = [];

  constructor( private userService : UserService, private secureStorageService : SecureStorageService, private reviewService : ReviewService){
    
  }

  ngOnInit(): void {
    this.loadUserInfo(this.Review.userId);
    this.extractDateParts(this.Review.createdOn);
    if(this.userService.isLoggedIn()){
      const storedUserId = Number(this.secureStorageService.getUserId());
      this.userid = storedUserId;
    }
    this.hasVoted = this.checkIfUserVoted(this.userid);
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

  deleteReview(): void{
    if(window.confirm('Bạn có chắc chắn muốn xoá đánh giá này ?')){    
      this.reviewService.deleteReviewById(this.Review.id).subscribe({
        next: () => {
          console.log('Review deleted successfully');
          this.reviewDeleted.emit(this.Review.id); // Notify the parent about the deletion
        },
        error: (err) => {
          console.error('Failed to delete review:', err);
        },
      });
    }
  }

  checkIfUserVoted(userId: number): VoteReview[] {
    return this.Review.voteReview.filter(vote => vote.userId === userId);
  }
}
