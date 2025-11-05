import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRole = route.data['role'];
    const userRole = localStorage.getItem('role'); // from login later

    if (userRole === requiredRole) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
