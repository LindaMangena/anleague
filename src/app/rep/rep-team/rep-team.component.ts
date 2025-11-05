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

  // UI uses these to render columns/filters
  posOptions: Position[] = ['GK', 'DF', 'MD', 'AT'];

  constructor(
    private ratings: RatingsService,
    private store: TournamentStoreService
  ) {}

  /** Auto-generate a valid 23-man squad with ratings and a captain. */
  autoFill23(): void {
    const squad = this.ratings.autoSquad(); // expected to return 23 players
    this.players = Array.isArray(squad) ? squad : [];

    // pick first as captain by default
    this.captainId = this.players[0]?.id ?? null;
    this.players.forEach(p => (p.captain = p.id === this.captainId));
  }

  /** Mark a given player as captain. */
  setCaptain(id: string): void {
    this.players.forEach(p => (p.captain = p.id === id));
    this.captainId = id;
  }

  /** Add a blank player row (defaults to MD so ratings exist in all columns). */
  addEmptyPlayer(): void {
    const nextIdx = this.players.length + 1;
    const p = this.ratings.makePlayer(`New Player ${nextIdx}`, 'MD');
    this.players.push(p);
  }

  /** Remove a player by index. */
  remove(i: number): void {
    this.players.splice(i, 1);
    // keep captainId valid if captain was removed
    if (this.captainId && !this.players.some(p => p.id === this.captainId)) {
      this.captainId = this.players[0]?.id ?? null;
      this.players.forEach(p => (p.captain = p.id === this.captainId));
    }
  }

  /**
   * ===== Missing method (used by template) =====
   * Return players filtered by natural position for grouped display.
   */
  groupedPlayers(pos: Position): Player[] {
    return this.players.filter(p => p.natural === pos);
  }

  /** Persist the team into the store. */
  saveTeam(): void {
    const has23 = this.players.length === 23;
    const hasCaptain = !!this.captainId && this.players.some(p => p.id === this.captainId);

    if (!this.country.trim() || !this.manager.trim() || !has23 || !hasCaptain) {
      alert('Please provide Country, Manager and exactly 23 players with a captain.');
      return;
    }

    // make sure only one player has captain=true
    this.players.forEach(p => (p.captain = p.id === this.captainId));

    const team: Team = {
      id: crypto.randomUUID(),
      country: this.country.trim(),
      manager: this.manager.trim(),
      players: this.players,
      teamRating: this.ratings.teamRating(this.players),
      createdAt: new Date().toISOString()
    };

    this.store.addTeam(team);

    // reset form
    this.country = '';
    this.manager = '';
    this.players = [];
    this.captainId = null;

    alert('Team registered!');
  }

  /** For small UI badges etc. */
  get teamCount(): number {
    return this.store.teams.length;
  }
}
