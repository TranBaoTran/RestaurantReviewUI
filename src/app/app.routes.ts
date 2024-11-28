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
import { AdminComponent } from './components/admin/admin.component';
import { UserManagementComponent } from './components/admin/user-management/user-management.component';
import { RestaurantManagementComponent } from './components/admin/restaurant-management/restaurant-management.component';

import { CategoryComponent } from './components/admin/category/category.component';
import { DistrictComponent } from './components/admin/district/district.component';
import { ProvinceComponent } from './components/admin/province/province.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';

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
            { path : 'edit-profile', component: EditProfileComponent, canActivate: [userAuthGuard]}
        ]},
    {   path: 'login', component: LoginComponent},
    {   path: 'signup', component: SignupComponent},
    { 
        path: 'admin', 
        component: AdminComponent, 
        children:[
            { path: 'user-management', component: UserManagementComponent },
            { path: 'district', component: DistrictComponent },
            { path: 'province', component: ProvinceComponent },
            { path: 'restaurant-management', component: RestaurantManagementComponent },
            { path: 'category', component: CategoryComponent },
            { path: 'dashboard', component: AdminDashboardComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    }
];
