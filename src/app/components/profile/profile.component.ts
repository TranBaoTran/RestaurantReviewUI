import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { SecureStorageService } from '../../services/secure-storage.service';
import { ReviewCardComponent } from '../restaurant/review-card/review-card.component';
import { ReviewService } from '../../services/review.service';
import { Review } from '../../models/review.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReviewCardComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user !: User;
  restaurantReview : Review[] = []

  constructor(private userService : UserService, private secureStorageService : SecureStorageService, private reviewService : ReviewService) {}

  ngOnInit(): void {
    if(this.userService.isLoggedIn()){
      const storedUserId = Number(this.secureStorageService.getUserId());
      this.getUser(storedUserId);
      this.getReview(storedUserId);    
    }
  }

  getUser(storedUserId : number): void{
    this.userService.getUserById(storedUserId).subscribe({
      next: (data: User) => {
        if (data) {
          this.user = data;
        }
      },
      error: (error) => {
        console.error('Error fetching user:', error);
        window.alert('An error occurred while fetching the user.');
      },
      complete: () => {
        console.log('getUserById request completed.');
      },
    });      
  }

  getReview(storedUserId : number): void {
    this.reviewService.getUserReviews(storedUserId).subscribe({
      next: (data : Review[]) => {
        if (data) {
          this.restaurantReview = data;
        }
      },
      error: (error) => {
        console.error('Error fetching review by user:', error);
        window.alert('An error occurred while fetching the review by user.');
      },
      complete: () => {
        console.log('getReviewByUser request completed.');
      },
    })
  }

  onReviewDeleted(reviewId: number): void {
    console.log(`Review with ID ${reviewId} was deleted.`);
    this.getReview(Number(this.secureStorageService.getUserId())); // Reload the list of reviews
  }
}
