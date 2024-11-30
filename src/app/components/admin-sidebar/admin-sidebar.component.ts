import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css',
  animations: [
    trigger('slideToggle', [
      state('void', style({ height: '0px', opacity: 0, overflow: 'hidden' })),
      state('*', style({ height: '*', opacity: 1, overflow: 'hidden' })),
      transition('void <=> *', [
        animate('0.3s ease-in-out') // Điều chỉnh thời gian lướt xuống (1s)
      ])
    ])
  ]
})

export class AdminSidebarComponent {
  activeMenus: Set<string> = new Set(); // Lưu trữ các menu đang mở

  toggleMenu(menu: string): void {
    if (this.activeMenus.has(menu)) {
      this.activeMenus.delete(menu); // Nếu menu đang mở, đóng lại
    } else {
      this.activeMenus.add(menu); // Nếu menu đang đóng, mở ra
    }
  }

  isMenuActive(menu: string): boolean {
    return this.activeMenus.has(menu); // Kiểm tra menu có đang mở không
  }
}