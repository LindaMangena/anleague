import { Component } from '@angular/core';
import { RatingsService } from '../../core/ratings.service';
import { Player, Position, Team } from '../../core/models';
import { TournamentStoreService } from '../../core/tournament-store.service';

@Component({
  selector: 'app-rep-team',
  templateUrl: './rep-team.component.html',
  styleUrls: ['./rep-team.component.css']
})
export class RepTeamComponent {
  country = '';
  manager = '';
  players: Player[] = [];
  captainId: string | null = null;
  posOptions: Position[] = ['GK', 'DF', 'MD', 'AT'];

  constructor(private ratings: RatingsService, private store: TournamentStoreService) {}

  autoFill23() {
    this.players = this.ratings.autoSquad();
    this.captainId = this.players[0]?.id ?? null;
    if (this.captainId) this.players[0].captain = true;
  }

  setCaptain(id: string) {
    this.players.forEach(p => p.captain = (p.id === id));
    this.captainId = id;
  }

  addEmptyPlayer() {
    const p = this.ratings.makePlayer(`New Player ${this.players.length + 1}`, 'MD');
    this.players.push(p);
  }

  remove(i: number) { this.players.splice(i, 1); }

  saveTeam() {
    if (!this.country || !this.manager || this.players.length !== 23 || !this.captainId) {
      alert('Please provide Country, Manager and exactly 23 players with a captain.');
      return;
    }
    const team: Team = {
      id: crypto.randomUUID(),
      country: this.country.trim(),
      manager: this.manager.trim(),
      players: this.players,
      teamRating: this.ratings.teamRating(this.players),
      createdAt: new Date().toISOString()
    };
    this.store.addTeam(team);
    this.country = '';
    this.manager = '';
    this.players = [];
    this.captainId = null;
    alert('Team registered!');
  }

  get teamCount(): number { return this.store.teams.length; }
}
