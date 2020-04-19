import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { concatMap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

import * as BookingActions from './booking.actions';


@Injectable()
export class BookingEffects {


  loadBookings$ = createEffect(() => {
    return this.actions$.pipe( 

      ofType(BookingActions.loadBookings),
      /** An EMPTY observable only emits completion. Replace with your own observable API request */
      concatMap(() => EMPTY)
    );
  });


  constructor(private actions$: Actions) {}

}
