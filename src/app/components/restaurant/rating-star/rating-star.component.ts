import { Component, Input, Output } from '@angular/core';

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
 @Output() OutputRaing : number = this.rating;

 setRating(value: number){
  if(this.readonly){
    return;
  }
  this.rating = value;  
 }
 
}
