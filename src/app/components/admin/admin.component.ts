import { Component } from '@angular/core';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterModule, AdminHeaderComponent, AdminSidebarComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})

export class AdminComponent {

}
