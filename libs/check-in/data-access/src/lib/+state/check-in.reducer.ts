import { Action, createReducer, on } from '@ngrx/store';
import * as CheckInActions from './check-in.actions';

export const checkInFeatureKey = 'checkIn';

export interface State {

}

export const initialState: State = {

};


export const reducer = createReducer(
  initialState,

  on(CheckInActions.loadCheckIns, state => state),

);

