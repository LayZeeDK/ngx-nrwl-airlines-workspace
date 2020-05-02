import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { concatMap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

import * as SeatmapActions from './seatmap.actions';


@Injectable()
export class SeatmapEffects {


  loadSeatmaps$ = createEffect(() => {
    return this.actions$.pipe( 

      ofType(SeatmapActions.loadSeatmaps),
      /** An EMPTY observable only emits completion. Replace with your own observable API request */
      concatMap(() => EMPTY)
    );
  });


  constructor(private actions$: Actions) {}

}
