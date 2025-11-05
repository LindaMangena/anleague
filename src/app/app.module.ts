import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
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
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TeamsComponent } from './pages/teams/teams.component';
import { TeamDetailComponent } from './pages/team-detail/team-detail.component';
// ... add to imports



@NgModule({
  declarations: [
    AppComponent,
    PublicLayoutComponent,
    AdminLayoutComponent,
    RepLayoutComponent,
    HomeComponent,
    BracketComponent,
    MatchDetailComponent,
    TopScorersComponent,
    LoginComponent,
    RegisterRepComponent,
    RepTeamComponent,
    AdminDashboardComponent,
    AdminMatchesComponent,
    TeamsComponent,
    TeamDetailComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule


  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
