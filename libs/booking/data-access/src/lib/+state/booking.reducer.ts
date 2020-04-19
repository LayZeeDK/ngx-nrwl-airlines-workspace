import { Action, createReducer, on } from '@ngrx/store';
import * as BookingActions from './booking.actions';

export const bookingFeatureKey = 'booking';

export interface State {

}

export const initialState: State = {

};


export const reducer = createReducer(
  initialState,

  on(BookingActions.loadBookings, state => state),

);

