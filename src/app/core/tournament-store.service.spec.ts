import { TestBed } from '@angular/core/testing';

import { TournamentStoreService } from './tournament-store.service';

describe('TournamentStoreService', () => {
  let service: TournamentStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TournamentStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
