import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { RepLayoutComponent } from './layouts/rep-layout/rep-layout.component';

import { HomeComponent } from './public/home/home.component';
import { BracketComponent } from './public/bracket/bracket.component';
import { MatchDetailComponent } from './public/match-detail/match-detail.component';
import { TopScorersComponent } from './public/top-scorers/top-scorers.component';

import { LoginComponent } from './auth/login/login.component';
import { RegisterRepComponent } from './auth/register-rep/register-rep.component';

import { RepTeamComponent } from './rep/rep-team/rep-team.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminMatchesComponent } from './admin/admin-matches/admin-matches.component';

import { RoleGuard } from './core/role.guard';

const routes: Routes = [
  // PUBLIC PAGES + AUTH
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'bracket', component: BracketComponent },
      { path: 'match/:id', component: MatchDetailComponent },
      { path: 'top-scorers', component: TopScorersComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register-rep', component: RegisterRepComponent },
    ]
  },

  // REPRESENTATIVE DASHBOARD (Protected)
  {
    path: 'rep',
    component: RepLayoutComponent,
    canActivate: [RoleGuard], data: { role: 'rep' }, // ✅ lowercase role (matches localStorage)
    children: [
      { path: '', redirectTo: 'team', pathMatch: 'full' },
      { path: 'team', component: RepTeamComponent },
    ]
  },

  // ADMIN DASHBOARD (Protected)
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [RoleGuard], data: { role: 'admin' }, // ✅ lowercase role
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'matches', component: AdminMatchesComponent },
    ]
  },

  // ANY UNKNOWN ROUTE → HOME
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'top',
      anchorScrolling: 'enabled'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
