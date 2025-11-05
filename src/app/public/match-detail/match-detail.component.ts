import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TournamentStoreService } from '../../core/tournament-store.service';
import { Match } from '../../core/models';

@Component({
  selector: 'app-match-detail',
  templateUrl: './match-detail.component.html',
  styleUrls: ['./match-detail.component.css']
})
export class MatchDetailComponent {
  match?: Match;

  constructor(private route: ActivatedRoute, public store: TournamentStoreService) {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.match = store.getMatch(id);
  }

  teamName(id: string): string {
    const t = this.store.teams.find(t => t.id === id);
    return t ? t.country : 'TBD';
  }
}
