import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { BookingEffects } from './booking.effects';

describe('BookingEffects', () => {
  let actions$: Observable<any>;
  let effects: BookingEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BookingEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get<BookingEffects>(BookingEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
