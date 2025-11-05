import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TournamentStoreService } from '../../core/tournament-store.service';
import { Player, Position, Team } from '../../core/models';

@Component({
  selector: 'app-team-detail',
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.css']
})
export class TeamDetailComponent {
  team?: Team;
  posOrder: Position[] = ['GK', 'DF', 'MD', 'AT'];

  constructor(
    private route: ActivatedRoute,
    private store: TournamentStoreService
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.team = this.store.teams.find(t => t.id === id);
  }

  grouped(pos: Position): Player[] {
    return (this.team?.players ?? []).filter(p => p.natural === pos);
  }
}
