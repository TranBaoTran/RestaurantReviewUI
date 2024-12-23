import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantReviewComponent } from './restaurant-review.component';

describe('RestaurantReviewComponent', () => {
  let component: RestaurantReviewComponent;
  let fixture: ComponentFixture<RestaurantReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantReviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
