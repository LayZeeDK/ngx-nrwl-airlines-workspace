import { Action, createReducer, on } from '@ngrx/store';
import * as SeatmapActions from './seatmap.actions';

export const seatmapFeatureKey = 'seatmap';

export interface State {

}

export const initialState: State = {

};


export const reducer = createReducer(
  initialState,

  on(SeatmapActions.loadSeatmaps, state => state),

);

