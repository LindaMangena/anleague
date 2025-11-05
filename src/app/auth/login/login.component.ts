import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private router: Router) {}

  get role(): string | null {
    return localStorage.getItem('role');
  }

  // Login as Admin
  enterAdmin() {
    localStorage.setItem('role', 'ADMIN');
    this.router.navigate(['/admin']);
  }

  // Login as Rep
  enterRep() {
    localStorage.setItem('role', 'REP');
    this.router.navigate(['/rep']);
  }

  // Go to area if already logged in
  goToArea() {
    if (this.role === 'ADMIN') this.router.navigate(['/admin']);
    else if (this.role === 'REP') this.router.navigate(['/rep']);
  }

  // Logout
  logout() {
    localStorage.removeItem('role');
    this.router.navigate(['/']);
  }
}
