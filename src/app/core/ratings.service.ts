import { Injectable } from '@angular/core';
import { Player, Position } from './models';

@Injectable({ providedIn: 'root' })
export class RatingsService {
  private positions: Position[] = ['GK', 'DF', 'MD', 'AT'];

  makePlayer(name: string, natural: Position): Player {
    const ratings: Record<Position, number> = { GK: 0, DF: 0, MD: 0, AT: 0 };
    for (const p of this.positions) {
      ratings[p] = p === natural
        ? this.randInt(50, 100) // natural 50–100
        : this.randInt(0, 50);  // other 0–50
    }
    return {
      id: crypto.randomUUID(),
      name,
      natural,
      ratings,
      captain: false
    };
  }

  autoSquad(): Player[] {
    const names = Array.from({ length: 23 }, (_, i) => `Player ${i + 1}`);
    // 3 GK, 7 DF, 7 MD, 6 AT (total 23)
    const layout: Position[] = [
      ...Array(3).fill('GK'),
      ...Array(7).fill('DF'),
      ...Array(7).fill('MD'),
      ...Array(6).fill('AT')
    ] as Position[];
    return names.map((n, i) => this.makePlayer(n, layout[i]));
  }

  teamRating(players: Player[]): number {
    if (!players.length) return 0;
    const sum = players.reduce((acc, p) => acc + p.ratings[p.natural], 0);
    return Math.round((sum / players.length) * 10) / 10;
  }

  private randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
