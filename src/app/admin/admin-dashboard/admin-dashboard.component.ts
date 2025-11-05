import { Component } from '@angular/core';
import { RoundCode, RoundOrder, Team } from '../../core/models';
import { TournamentStoreService } from '../../core/tournament-store.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {
  rounds: RoundCode[] = [...RoundOrder];

  constructor(public store: TournamentStoreService) {}

  get teams(): Team[] { return this.store.teams; }

  start() { this.store.startTournament(); }
  reset() { 
    if (confirm('Reset tournament back to Quarter-finals?')) this.store.resetTournament(); 
  }

  simulate(id: string) { this.store.simulateMatch(id); }
  play(id: string) { this.store.playMatch(id); }

  teamName(id: string): string {
    const t = this.store.teams.find(t => t.id === id);
    return t ? t.country : 'TBD';
    }
}
