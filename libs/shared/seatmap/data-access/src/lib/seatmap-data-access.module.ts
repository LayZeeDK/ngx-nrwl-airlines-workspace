import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { SeatmapEffects } from './+state/seatmap.effects';
import * as fromSeatmap from './+state/seatmap.reducer';

@NgModule({
  imports: [
    StoreModule.forFeature(fromSeatmap.seatmapFeatureKey, fromSeatmap.reducer),
    EffectsModule.forFeature([SeatmapEffects]),
  ],
})
export class SeatmapDataAccessModule { }
