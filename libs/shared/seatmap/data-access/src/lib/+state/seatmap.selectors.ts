import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromSeatmap from './seatmap.reducer';

export const selectSeatmapState = createFeatureSelector<fromSeatmap.State>(
  fromSeatmap.seatmapFeatureKey
);
