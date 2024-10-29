import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MdbDropdownModule } from 'mdb-angular-ui-kit/dropdown';
import { MdbCollapseModule } from 'mdb-angular-ui-kit/collapse';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MdbDropdownModule, MdbCollapseModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent {
  checkboxes = Array(10).fill(0);
  checkboxStates = Array(this.checkboxes.length).fill(false);
  dropDownProvince = 'TP.HCM';
  
  updateDropdown(text: string, event: Event) {
    event.preventDefault();
    this.dropDownProvince = text;
  }

  uncheckAll() {
    this.checkboxStates = this.checkboxStates.map(() => false);
  }
}
