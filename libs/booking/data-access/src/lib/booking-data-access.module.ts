import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { BookingEffects } from './+state/booking.effects';
import * as fromBooking from './+state/booking.reducer';

@NgModule({
  imports: [
    StoreModule.forFeature(fromBooking.bookingFeatureKey, fromBooking.reducer),
    EffectsModule.forFeature([BookingEffects]),
  ],
})
export class BookingDataAccessModule { }
