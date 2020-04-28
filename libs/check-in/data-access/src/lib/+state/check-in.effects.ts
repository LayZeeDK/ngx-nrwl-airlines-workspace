import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY } from 'rxjs';
import { concatMap } from 'rxjs/operators';

import * as CheckInActions from './check-in.actions';

@Injectable()
export class CheckInEffects {
  loadCheckIns$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CheckInActions.loadCheckIns),
      /** An EMPTY observable only emits completion. Replace with your own observable API request */
      concatMap(() => EMPTY)
    );
  });

  constructor(private actions$: Actions) { }
}
