import { createReducer, on } from '@ngrx/store';

import * as BookingActions from './booking.actions';

export const bookingFeatureKey = 'booking';

export type State = {};

export const initialState: State = {};

export const reducer = createReducer(
  initialState,
  on(BookingActions.loadBookings, state => state),
);

