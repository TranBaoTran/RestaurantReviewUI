import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RestaurantDetailComponent } from './components/restaurant/restaurant-detail/restaurant-detail.component';
import { PostReviewComponent } from './components/restaurant/post-review/post-review.component';

export const routes: Routes = [
    {   path: '', 
        component: HomeComponent,
        children: [
            { path: '', component: DashboardComponent },
            { path: 'restaurants/:id', component: RestaurantDetailComponent},
            { path: 'restaurants/:id/review', component: PostReviewComponent}
        ]},
    { path: 'login', component: LoginComponent},
    { path: 'signup', component: SignupComponent}
];
