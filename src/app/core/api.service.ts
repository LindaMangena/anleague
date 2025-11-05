import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Match, Team } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = 'http://localhost:3000'; // change to your backend URL later
  constructor(private http: HttpClient) {}

  // Auth
  login(payload: { email: string; password: string }): Observable<{ token:string; role:'ADMIN'|'REP' }> {
    return this.http.post<{ token:string; role:'ADMIN'|'REP' }>(`${this.base}/auth/login`, payload);
  }

  // Public
  getBracket(): Observable<any> { return this.http.get(`${this.base}/public/bracket`); }
  getTopScorers(): Observable<any[]> { return this.http.get<any[]>(`${this.base}/public/leaderboard/scorers`); }
  getMatch(id: string): Observable<Match> { return this.http.get<Match>(`${this.base}/public/matches/${id}`); }

  // Rep
  getMyTeam(): Observable<Team> { return this.http.get<Team>(`${this.base}/teams/me`); }
  saveTeam(team: Team): Observable<Team> { return this.http.post<Team>(`${this.base}/teams`, team); }
  randomizePlayers(n = 23): Observable<any> { return this.http.post(`${this.base}/players/randomize`, { count: n }); }

  // Admin
  startTournament(): Observable<any> { return this.http.post(`${this.base}/admin/tournament/start`, {}); }
  listMatches(): Observable<Match[]> { return this.http.get<Match[]>(`${this.base}/admin/matches`); }
  playMatch(id: string): Observable<Match> { return this.http.post<Match>(`${this.base}/admin/matches/${id}/play`, {}); }
  simulateMatch(id: string): Observable<Match> { return this.http.post<Match>(`${this.base}/admin/matches/${id}/simulate`, {}); }
}
