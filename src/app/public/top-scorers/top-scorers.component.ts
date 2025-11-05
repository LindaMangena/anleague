import { Component } from '@angular/core';
import { TournamentStoreService } from '../../core/tournament-store.service';

@Component({
  selector: 'app-top-scorers',
  templateUrl: './top-scorers.component.html',
  styleUrls: ['./top-scorers.component.css']
})
export class TopScorersComponent {
  constructor(public store: TournamentStoreService) {}
  teamName(id: string): string {
    const t = this.store.teams.find(t => t.id === id);
    return t ? t.country : 'TBD';
  }
}
