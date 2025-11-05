import { Injectable } from '@angular/core';
import {
  CommentaryEvent,
  GoalEvent,
  Match,
  MatchStatus,
  RoundCode,
  RoundOrder,
  Team,
  Player,
  Position,
} from './models';

interface State {
  teams: Team[];
  matches: Match[]; // all rounds
}

const KEY = 'anleague-state';

@Injectable({ providedIn: 'root' })
export class TournamentStoreService {
  private state: State = this.load();

  constructor() {
    this.seedDemoIfEmpty();
  }

  // ---------- PUBLIC READERS ----------
  get teams(): Team[] {
    return this.state.teams;
  }
  get matches(): Match[] {
    return this.state.matches;
  }

  getRound(round: RoundCode): Match[] {
    return this.state.matches.filter((m) => m.round === round);
  }

  matchesByRound(round: 'QF' | 'SF' | 'F'): Match[] {
    return this.state.matches.filter((m) => m.round === round);
  }

  getMatch(id: string): Match | undefined {
    return this.state.matches.find((m) => m.id === id);
  }

  /** NEW: convenience accessor */
  getTeam(id: string): Team | undefined {
    return this.state.teams.find(t => t.id === id);
  }

  // ---------- TEAM OPS ----------
  addTeam(t: Team): void {
    this.state.teams.push(t);
    this.persist();
  }

  resetTournament(): void {
    this.state.matches = [];
    this.persist();
  }

  // ---------- START / BRACKET ----------
  startTournament(): void {
    if (this.state.teams.length < 8) return;

    const eight = this.state.teams.slice(0, 8);

    const qf: Match[] = Array.from({ length: 4 }, (_, i) => ({
      id: crypto.randomUUID(),
      round: 'QF',
      homeId: eight[i * 2].id,
      awayId: eight[i * 2 + 1].id,
      status: 'pending',
      homeScore: 0,
      awayScore: 0,
      goals: [],
    }));

    const sf: Match[] = [
      {
        id: crypto.randomUUID(),
        round: 'SF',
        homeId: '',
        awayId: '',
        status: 'pending',
        homeScore: 0,
        awayScore: 0,
        goals: [],
      },
      {
        id: crypto.randomUUID(),
        round: 'SF',
        homeId: '',
        awayId: '',
        status: 'pending',
        homeScore: 0,
        awayScore: 0,
        goals: [],
      },
    ];

    const f: Match = {
      id: crypto.randomUUID(),
      round: 'F',
      homeId: '',
      awayId: '',
      status: 'pending',
      homeScore: 0,
      awayScore: 0,
      goals: [],
    };

    qf[0].nextMatchId = sf[0].id;
    qf[1].nextMatchId = sf[0].id;
    qf[2].nextMatchId = sf[1].id;
    qf[3].nextMatchId = sf[1].id;
    sf[0].nextMatchId = f.id;
    sf[1].nextMatchId = f.id;

    this.state.matches = [...qf, ...sf, f];
    this.persist();
  }

  // ---------- SIMULATE ----------
  simulateMatch(matchId: string): void {
    const m = this.getMatch(matchId);
    if (!m || m.status !== 'pending') return;

    const [home, away] = [this.teamById(m.homeId), this.teamById(m.awayId)];
    const bias = (home.teamRating - away.teamRating) / 40; // small bias

    const homeGoals = this.poisson(1.2 + bias);
    const awayGoals = this.poisson(1.2 - bias);

    const goals: GoalEvent[] = [];
    for (let i = 0; i < homeGoals; i++) goals.push(this.goalFor(home.id));
    for (let i = 0; i < awayGoals; i++) goals.push(this.goalFor(away.id));
    goals.sort((a, b) => a.minute - b.minute);

    m.homeScore = homeGoals;
    m.awayScore = awayGoals;
    m.goals = goals;
    m.status = 'simulated';
    m.winnerId = this.winnerFrom(m.homeId, m.awayId, homeGoals, awayGoals);

    this.advance(m);
    this.persist();
  }

  // ---------- PLAY WITH COMMENTARY ----------
  playMatch(matchId: string): void {
    const m = this.getMatch(matchId);
    if (!m || m.status !== 'pending') return;

    const [home, away] = [this.teamById(m.homeId), this.teamById(m.awayId)];
    const bias = (home.teamRating - away.teamRating) / 40;

    const events: CommentaryEvent[] = [];
    const goals: GoalEvent[] = [];

    const chances = 8 + Math.floor(Math.random() * 8);
    for (let i = 0; i < chances; i++) {
      const minute = 5 + Math.floor(Math.random() * 86);
      const isHome = Math.random() < 0.5 + bias * 0.2;
      const team = isHome ? home : away;

      const goalHappened = Math.random() < 0.4;
      if (goalHappened) {
        const g = this.goalFor(team.id, minute);
        goals.push(g);
        events.push({
          minute,
          text: `${g.playerName} scores for ${this.teamById(team.id).country}!`,
        });
      } else {
        events.push({
          minute,
          text: `${team.country} on the attack, but it's cleared.`,
        });
      }
    }

    goals.sort((a, b) => a.minute - b.minute);
    events.sort((a, b) => a.minute - b.minute);

    const homeGoals = goals.filter((g) => g.teamId === home.id).length;
    const awayGoals = goals.filter((g) => g.teamId === away.id).length;

    if (homeGoals === awayGoals) {
      const winnerIsHome = Math.random() < 0.5 + bias * 0.2;
      const winner = winnerIsHome ? home : away;
      events.push({
        minute: 120,
        text: `After ET and penalties, ${winner.country} advance!`,
      });
      m.winnerId = winner.id;
    } else {
      m.winnerId = homeGoals > awayGoals ? home.id : away.id;
    }

    m.homeScore = homeGoals;
    m.awayScore = awayGoals;
    m.goals = goals;
    m.commentary = events;
    m.status = 'played';

    this.advance(m);
    this.persist();
  }

  // ---------- TOP SCORERS ----------
  topScorers(): { playerName: string; teamId: string; goals: number }[] {
    const tally = new Map<string, { name: string; teamId: string; goals: number }>();

    for (const m of this.state.matches) {
      if (m.status === 'pending') continue;
      for (const g of m.goals) {
        const key = `${g.teamId}-${g.playerName}`;
        const entry =
          tally.get(key) ?? { name: g.playerName, teamId: g.teamId, goals: 0 };
        entry.goals += 1;
        tally.set(key, entry);
      }
    }

    return Array.from(tally.values())
      .map((s) => ({
        playerName: s.name,
        teamId: s.teamId,
        goals: s.goals,
      }))
      .sort((a, b) => b.goals - a.goals);
  }

  // ---------- HELPERS ----------
  private teamById(id: string): Team {
    const t = this.state.teams.find((t) => t.id === id)!;
    return t;
  }

  private advance(m: Match): void {
    if (!m.nextMatchId || !m.winnerId) return;
    const next = this.getMatch(m.nextMatchId);
    if (!next) return;

    if (!next.homeId) next.homeId = m.winnerId;
    else if (!next.awayId) next.awayId = m.winnerId;
  }

  private goalFor(teamId: string, minute?: number): GoalEvent {
    const team = this.teamById(teamId);
    const pool = [...team.players].sort(() => Math.random() - 0.5);
    const striker = pool.find((p) => p.natural === 'AT') ?? pool[0];
    const min = minute ?? 5 + Math.floor(Math.random() * 86);
    return { teamId, minute: min, playerName: striker.name };
  }

  private winnerFrom(
    homeId: string,
    awayId: string,
    homeGoals: number,
    awayGoals: number
  ): string {
    if (homeGoals > awayGoals) return homeId;
    if (awayGoals > homeGoals) return awayId;

    const home = this.teamById(homeId);
    const away = this.teamById(awayId);
    const bias = (home.teamRating - away.teamRating) / 200;
    const pHome = 0.5 + bias;
    return Math.random() < pHome ? homeId : awayId;
  }

  private poisson(lambda: number): number {
    const L = Math.exp(-lambda);
    let k = 0, p = 1;
    do { k++; p *= Math.random(); } while (p > L);
    return k - 1;
  }

  private load(): State {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      try { return JSON.parse(raw) as State; } catch {}
    }
    return { teams: [], matches: [] };
  }

  private persist(): void {
    localStorage.setItem(KEY, JSON.stringify(this.state));
  }

  // ---------- DEMO SEED ----------
  /**
   * Seeds:
   * - 8 teams
   * - Each team: manager + 23-player squad (3 GK, 8 DF, 8 MD, 4 AT)
   * - One captain per team
   * - Bracket filled with QF→SF→F (as you already had)
   */
  private seedDemoIfEmpty(): void {
    if (this.state.teams.length || this.state.matches.length) return;

    const mkRatings = (nat: Position, base = 84): Record<Position, number> => {
      const r: Record<Position, number> = { GK: 40, DF: 40, MD: 40, AT: 40 };
      r[nat] = base;
      return r;
    };

    const P = (name: string, nat: Position, base = 84, captain = false): Player => ({
      id: crypto.randomUUID(),
      name,
      natural: nat,
      ratings: mkRatings(nat, base),
      captain,
    });

    const mk23 = (
      gk: string[], df: string[], md: string[], at: string[], captainName: string
    ): Player[] => {
      const players: Player[] = [];
      // 3 GK
      players.push(P(gk[0], 'GK', 83), P(gk[1], 'GK', 80), P(gk[2], 'GK', 78));
      // 8 DF
      df.forEach((n, i) => players.push(P(n, 'DF', 82 + (i % 3))));
      // 8 MD
      md.forEach((n, i) => players.push(P(n, 'MD', 83 + (i % 3))));
      // 4 AT
      at.forEach((n, i) => players.push(P(n, 'AT', 85 + (i % 3), n === captainName)));
      // Ensure someone is captain if captainName was not in AT list
      if (!players.some(p => p.captain)) {
        const idx = players.findIndex(p => p.name === captainName);
        if (idx >= 0) players[idx].captain = true;
        else players[players.length - 1].captain = true;
      }
      return players;
    };

    const makeTeam = (
      id: string,
      country: string,
      manager: string,
      squad: Player[]
    ): Team => {
      const teamRating =
        Math.round(
          squad.reduce((sum, p) => sum + p.ratings[p.natural], 0) / squad.length
        );
      return {
        id,
        country,
        manager,
        players: squad,
        teamRating,
        createdAt: new Date().toISOString(),
      };
    };

    // --- France ---
    const FRA = makeTeam(
      'FRA',
      'France',
      'Didier Deschamps',
      mk23(
        ['Maignan', 'Areola', 'Lafont'],
        ['Theo Hernández', 'Koundé', 'Upamecano', 'Saliba', 'Konaté', 'Lucas Hernández', 'Pavard', 'Clauss'],
        ['Rabiot', 'Tchouaméni', 'Camavinga', 'Kanté', 'Fekir', 'Thuram', 'Kolo Muani', 'Lemar'],
        ['Mbappé', 'Griezmann', 'Dembele', 'Giroud'],
        'Mbappé'
      )
    );

    // --- England ---
    const ENG = makeTeam(
      'ENG',
      'England',
      'Gareth Southgate',
      mk23(
        ['Pickford', 'Ramsdale', 'Johnstone'],
        ['Walker', 'Trippier', 'Maguire', 'Stones', 'Guehi', 'Shaw', 'Alexander-Arnold', 'Colwill'],
        ['Rice', 'Bellingham', 'Grealish', 'Foden', 'Mount', 'Maddison', 'Gallagher', 'Henderson'],
        ['Kane', 'Saka', 'Rashford', 'Watkins'],
        'Kane'
      )
    );

    // --- Spain ---
    const ESP = makeTeam(
      'ESP',
      'Spain',
      'Luis de la Fuente',
      mk23(
        ['Unai Simón', 'Raya', 'Remiro'],
        ['Carvajal', 'Laporte', 'Pau Torres', 'Le Normand', 'Azpilicueta', 'Gaya', 'Balde', 'Nacho'],
        ['Rodri', 'Pedri', 'Gavi', 'Merino', 'Thiago', 'Koke', 'Fabian Ruiz', 'Olmo'],
        ['Morata', 'Ferran Torres', 'Oyarzabal', 'Ansu Fati'],
        'Morata'
      )
    );

    // --- Portugal ---
    const POR = makeTeam(
      'POR',
      'Portugal',
      'Roberto Martínez',
      mk23(
        ['Diogo Costa', 'Rui Patrício', 'José Sá'],
        ['Cancelo', 'Ruben Dias', 'Pepe', 'Guerreiro', 'Mendes', 'Inácio', 'Dalot', 'Carvalho'],
        ['Bruno Fernandes', 'Bernardo Silva', 'Vitinha', 'Neves', 'Palhinha', 'Nunes', 'João Mario', 'Eustaquio'],
        ['Ronaldo', 'Diogo Jota', 'João Félix', 'Ramos'],
        'Ronaldo'
      )
    );

    // --- Belgium ---
    const BEL = makeTeam(
      'BEL',
      'Belgium',
      'Domenico Tedesco',
      mk23(
        ['Courtois', 'Casteels', 'Mignolet'],
        ['Vertonghen', 'Alderweireld', 'Faes', 'Castagne', 'Theate', 'Meunier', 'Dendoncker', 'Debast'],
        ['De Bruyne', 'Tielemans', 'Onana', 'Carrasco', 'Trossard', 'Witsel', 'Doku', 'Openda'],
        ['Lukaku', 'Batshuayi', 'Origi', 'Trossard'],
        'De Bruyne'
      )
    );

    // --- Italy ---
    const ITA = makeTeam(
      'ITA',
      'Italy',
      'Luciano Spalletti',
      mk23(
        ['Donnarumma', 'Meret', 'Vicario'],
        ['Bastoni', 'Acerbi', 'Di Lorenzo', 'Spinazzola', 'Toloi', 'Darmian', 'Scalvini', 'Dimarco'],
        ['Barella', 'Jorginho', 'Locatelli', 'Frattesi', 'Pellegrini', 'Veratti', 'Zaniolo', 'Raspadori'],
        ['Immobile', 'Chiesa', 'Politano', 'Kean'],
        'Barella'
      )
    );

    // --- Netherlands ---
    const NED = makeTeam(
      'NED',
      'Netherlands',
      'Ronald Koeman',
      mk23(
        ['Cillessen', 'Bijlow', 'Flekken'],
        ['Van Dijk', 'Ake', 'De Vrij', 'Timber', 'Blind', 'Dumfries', 'Botman', 'Malacia'],
        ['Frenkie de Jong', 'Wijnaldum', 'Koopmeiners', 'Gravenberch', 'Simons', 'Veerman', 'Berghuis', 'Wieffer'],
        ['Depay', 'Gakpo', 'Malen', 'Weghorst'],
        'Van Dijk'
      )
    );

    // --- Germany ---
    const GER = makeTeam(
      'GER',
      'Germany',
      'Julian Nagelsmann',
      mk23(
        ['Neuer', 'Ter Stegen', 'Trapp'],
        ['Rüdiger', 'Süle', 'Tah', 'Henrichs', 'Gosens', 'Schlotterbeck', 'Raum', 'Hummels'],
        ['Kimmich', 'Gündoğan', 'Musiala', 'Havertz', 'Brandt', 'Can', 'Goretzka', 'Wirtz'],
        ['Werner', 'Sané', 'Müller', 'Adeyemi'],
        'Kimmich'
      )
    );

    const teams: Team[] = [FRA, BEL, ENG, ITA, ESP, POR, NED, GER];

    // --- Pre-filled bracket (same as before) ---
    const goals = (teamId: string, minutes: number[], scorer: string): GoalEvent[] =>
      minutes.map((minute) => ({ teamId, minute, playerName: scorer }));

    const qf1: Match = {
      id: crypto.randomUUID(),
      round: 'QF',
      homeId: 'FRA',
      awayId: 'BEL',
      status: 'played',
      homeScore: 2,
      awayScore: 0,
      goals: [...goals('FRA', [18, 61], 'Mbappé')],
      winnerId: 'FRA',
    };

    const qf2: Match = {
      id: crypto.randomUUID(),
      round: 'QF',
      homeId: 'ENG',
      awayId: 'ITA',
      status: 'played',
      homeScore: 2,
      awayScore: 0,
      goals: [...goals('ENG', [55, 79], 'Kane')],
      winnerId: 'ENG',
    };

    const qf3: Match = {
      id: crypto.randomUUID(),
      round: 'QF',
      homeId: 'ESP',
      awayId: 'GER',
      status: 'played',
      homeScore: 1,
      awayScore: 0,
      goals: [...goals('ESP', [34], 'Morata')],
      winnerId: 'ESP',
    };

    const qf4: Match = {
      id: crypto.randomUUID(),
      round: 'QF',
      homeId: 'POR',
      awayId: 'NED',
      status: 'played',
      homeScore: 1,
      awayScore: 0,
      goals: [...goals('POR', [70], 'Ronaldo')],
      winnerId: 'POR',
    };

    const sf1: Match = {
      id: crypto.randomUUID(),
      round: 'SF',
      homeId: 'FRA',
      awayId: 'ENG',
      status: 'played',
      homeScore: 2,
      awayScore: 1,
      goals: [
        ...goals('FRA', [22, 88], 'Mbappé'),
        ...goals('ENG', [67], 'Kane'),
      ],
      winnerId: 'FRA',
    };

    const sf2: Match = {
      id: crypto.randomUUID(),
      round: 'SF',
      homeId: 'ESP',
      awayId: 'POR',
      status: 'played',
      homeScore: 2,
      awayScore: 1,
      goals: [
        ...goals('ESP', [12, 90], 'Morata'),
        ...goals('POR', [77], 'Ronaldo'),
      ],
      winnerId: 'ESP',
    };

    const f1: Match = {
      id: crypto.randomUUID(),
      round: 'F',
      homeId: 'FRA',
      awayId: 'ESP',
      status: 'played',
      homeScore: 2,
      awayScore: 1,
      goals: [
        ...goals('FRA', [39, 81], 'Mbappé'),
        ...goals('ESP', [58], 'Morata'),
      ],
      winnerId: 'FRA',
    };

    qf1.nextMatchId = sf1.id;
    qf2.nextMatchId = sf1.id;
    qf3.nextMatchId = sf2.id;
    qf4.nextMatchId = sf2.id;
    sf1.nextMatchId = f1.id;
    sf2.nextMatchId = f1.id;

    this.state = {
      teams,
      matches: [qf1, qf2, qf3, qf4, sf1, sf2, f1],
    };
    this.persist();
  }
}
