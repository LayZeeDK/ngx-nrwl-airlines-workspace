import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromCheckIn from './check-in.reducer';

export const selectCheckInState = createFeatureSelector<fromCheckIn.State>(
  fromCheckIn.checkInFeatureKey
);
