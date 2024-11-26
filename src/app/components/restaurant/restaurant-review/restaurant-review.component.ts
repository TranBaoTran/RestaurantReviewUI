import { Component, OnInit} from '@angular/core';
import { ReviewService } from '../../../services/review.service';
import { Review,  } from '../../../models/review.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ReviewCardComponent } from '../review-card/review-card.component';

@Component({
  selector: 'app-restaurant-review',
  standalone: true,
  imports: [ReviewCardComponent],
  templateUrl: './restaurant-review.component.html',
  styleUrl: './restaurant-review.component.css'
})
export class RestaurantReviewComponent implements OnInit {
  restaurantReview : Review[] = []
  hasVoted : boolean = false; 
  
  constructor(private router : Router, private reviewService : ReviewService, 
    private activatedRoute : ActivatedRoute) {
   
  }

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews() {
    const id = Number(this.activatedRoute.snapshot.paramMap.get('id'));

    if(!id) return;

    this.reviewService.getRestaurantReviews(id).subscribe({
      next: (data : Review[]) => {
        this.restaurantReview = data
      },
      error: (error) => {
        console.log("Can't fetch Review:" + error);
      }
    })
  }

  goToPostReview(): void{
    const id = Number(this.activatedRoute.snapshot.paramMap.get('id'));

    if(!id) return;

    this.router.navigate([`/restaurants/${id}/review`])
  }

  onReviewDeleted(reviewId: number): void {
    console.log(`Review with ID ${reviewId} was deleted.`);
    this.loadReviews(); // Reload the list of reviews
  }



  // sortByDate() {
  //   this.filterReview = this.sortReviewsByDate(this.restaurantReview)
  // }

  // extractDateParts(dateString: string) {
  //   const datePart = dateString.split('T')[0]; // Lấy phần ngày từ chuỗi (phần trước chữ 'T')
  //   const [year, month, day] = datePart.split('-').map(Number); // Tách năm, tháng, ngày và chuyển thành số
  //   return { day , month , year }
  // }


  // sortReviewsByDate(reviews : Review[]) {
  //   return reviews.sort((a, b) => {
  //       const dateA = this.extractDateParts(a.createdOn);
  //       const dateB = this.extractDateParts(b.createdOn);

  //       // So sánh theo thứ tự năm, tháng, ngày
  //       if (dateA.year !== dateB.year) {
  //           return dateA.year - dateB.year;
  //       } else if (dateA.month !== dateB.month) {
  //           return dateA.month - dateB.month;
  //       } else {
  //           return dateA.day - dateB.day;
  //       }
  //   });
  // }
}
