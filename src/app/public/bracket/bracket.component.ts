import { Component } from '@angular/core';
import { TournamentStoreService } from '../../core/tournament-store.service';
import { RoundCode } from '../../core/models';

@Component({
  selector: 'app-bracket',
  templateUrl: './bracket.component.html',
  styleUrls: ['./bracket.component.css']
})
export class BracketComponent {
  constructor(public store: TournamentStoreService) {}
  rounds: RoundCode[] = ['QF', 'SF', 'F'];

  teamName(id: string): string {
    const t = this.store.teams.find(t => t.id === id);
    return t ? t.country : 'TBD';
  }
}
