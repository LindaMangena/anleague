import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Bracket, Match, Team, TopScorerRow } from './models';

@Injectable({ providedIn: 'root' })
export class DataService {
  // -------- Mock Data --------
  private teams: Team[] = [
    { id: 'FRA', name: 'France' },
    { id: 'ENG', name: 'England' },
    { id: 'ESP', name: 'Spain' },
    { id: 'POR', name: 'Portugal' },
    { id: 'NED', name: 'Netherlands' },
    { id: 'GER', name: 'Germany' },
    { id: 'ITA', name: 'Italy' },
    { id: 'BEL', name: 'Belgium' },
  ];

  private bracket: Bracket = {
    qf: [
      { id: 'QF1', home: 'FRA', away: 'BEL', date: '2025-06-20T18:00:00Z' },
      { id: 'QF2', home: 'ENG', away: 'ITA', date: '2025-06-21T18:00:00Z' },
      { id: 'QF3', home: 'ESP', away: 'GER', date: '2025-06-22T18:00:00Z' },
      { id: 'QF4', home: 'POR', away: 'NED', date: '2025-06-23T18:00:00Z' },
    ],
    sf: [
      { id: 'SF1', home: 'FRA', away: 'ENG', date: '2025-06-27T18:00:00Z' },
      { id: 'SF2', home: 'ESP', away: 'POR', date: '2025-06-28T18:00:00Z' },
    ],
    f: { id: 'FNL', home: 'FRA', away: 'ESP', date: '2025-07-05T18:00:00Z' },
  };

  private topScorers: TopScorerRow[] = [
    { player: 'Mbappé', team: 'France', goals: 4 },
    { player: 'Kane', team: 'England', goals: 3 },
    { player: 'Morata', team: 'Spain', goals: 3 },
    { player: 'Ronaldo', team: 'Portugal', goals: 2 },
  ];

  // -------- Public API --------
  getTeams(): Observable<Team[]> {
    return of(this.teams);
  }

  getBracket(): Observable<Bracket> {
    return of(this.bracket);
  }

  getMatchById(id: string): Observable<Match | undefined> {
    const all = [
      ...this.bracket.qf,
      ...this.bracket.sf,
      ...(this.bracket.f ? [this.bracket.f] : []),
    ];
    return of(all.find(m => m.id === id));
  }

  getTopScorers(): Observable<TopScorerRow[]> {
    return of(this.topScorers);
  }

  // -------- Rep area (localStorage) --------
  saveRepTeam(team: Team): Observable<void> {
    localStorage.setItem('rep_team', JSON.stringify(team));
    return of(void 0);
  }

  getRepTeam(): Observable<Team | null> {
    const raw = localStorage.getItem('rep_team');
    return of(raw ? (JSON.parse(raw) as Team) : null);
  }
}
