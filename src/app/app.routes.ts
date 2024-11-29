import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RestaurantDetailComponent } from './components/restaurant/restaurant-detail/restaurant-detail.component';
import { PostReviewComponent } from './components/restaurant/post-review/post-review.component';
import { SearchComponent } from './components/search/search.component';
import { ProfileComponent } from './components/profile/profile.component';
import { userAuthGuard } from './guards/user-auth.guard';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { AddRestaurantComponent } from './components/restaurant/add-restaurant/add-restaurant.component';
import { EditRestaurantComponent } from './components/restaurant/edit-restaurant/edit-restaurant.component';

export const routes: Routes = [
    {   path: '', 
        component: HomeComponent,
        children: [
            { path: '', component: DashboardComponent },
            { path: 'province/:query', component: DashboardComponent},
            { path: 'search', component: SearchComponent },
            { path: 'restaurants/:id', component: RestaurantDetailComponent},
            { path: 'restaurants/:id/review', component: PostReviewComponent, canActivate: [userAuthGuard] },
            { path: 'profile', component: ProfileComponent, canActivate: [userAuthGuard] },
            { path: 'edit-profile', component: EditProfileComponent, canActivate: [userAuthGuard]},
            { path: 'add-restaurant', component: AddRestaurantComponent, canActivate: [userAuthGuard]},
            { path: 'edit-restaurant', component: EditRestaurantComponent, canActivate: [userAuthGuard]}
        ]},
    {   path: 'login', component: LoginComponent},
    {   path: 'signup', component: SignupComponent}
];
