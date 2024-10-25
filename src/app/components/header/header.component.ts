import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MdbDropdownModule } from 'mdb-angular-ui-kit/dropdown';
import { MdbCollapseModule } from 'mdb-angular-ui-kit/collapse';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MdbDropdownModule, MdbCollapseModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

}
