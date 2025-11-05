import { Component } from '@angular/core';
import { TournamentStoreService } from '../../core/tournament-store.service';
import { Team } from '../../core/models';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent {
  constructor(private store: TournamentStoreService) {}

  get teams(): Team[] {
    return this.store.teams;
  }
}
