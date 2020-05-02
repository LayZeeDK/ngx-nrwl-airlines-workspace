import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { SeatmapEffects } from './seatmap.effects';

describe('SeatmapEffects', () => {
  let actions$: Observable<any>;
  let effects: SeatmapEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SeatmapEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get<SeatmapEffects>(SeatmapEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
