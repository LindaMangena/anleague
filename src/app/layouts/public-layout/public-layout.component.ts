import { Component } from '@angular/core';

@Component({
  selector: 'app-public-layout',
  templateUrl: './public-layout.component.html',
})
export class PublicLayoutComponent {
  currentYear = new Date().getFullYear();
  get role(): string | null {
    return localStorage.getItem('role');
  }
  logout() {
    localStorage.removeItem('role');
  }
}
