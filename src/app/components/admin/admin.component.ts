import { Component } from '@angular/core';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { RestaurantManagementComponent } from './restaurant-management/restaurant-management.component';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterModule, AdminHeaderComponent, AdminSidebarComponent, UserManagementComponent, 
              RestaurantManagementComponent, DashboardComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})

export class AdminComponent {

}
