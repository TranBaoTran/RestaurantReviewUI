import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-rating-star',
  standalone: true,
  imports: [],
  templateUrl: './rating-star.component.html',
  styleUrl: './rating-star.component.scss'
})
export class RatingStarComponent {
 @Input() rating:number  = 0;
 @Input() readonly:boolean = false;
 @Output() ratingChange: EventEmitter<number> = new EventEmitter<number>();

 setRating(value: number){
  if(this.readonly){
    return;
  }
  this.rating = value;  
  this.ratingChange.emit(this.rating);
 }
}
