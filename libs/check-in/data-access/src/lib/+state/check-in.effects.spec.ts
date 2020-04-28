import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';

import { CheckInEffects } from './check-in.effects';

describe('CheckInEffects', () => {
  let actions$: Observable<any>;
  let effects: CheckInEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CheckInEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject<CheckInEffects>(CheckInEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  it('has an action', () => {
    actions$ = of({ type: 'Action One' });
  });
});
