import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-rating-star',
  standalone: true,
  imports: [],
  templateUrl: './rating-star.component.html',
  styleUrl: './rating-star.component.scss'
})
export class RatingStarComponent {
 @Input() rating:number | undefined = 0;
 @Input() readonly:boolean = false;
 setRating(value: number){
  if(this.readonly){
    return;
  }
  this.rating = value;  
 }
 
}
