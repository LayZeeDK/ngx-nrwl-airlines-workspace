import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import * as fromCheckIn from './+state/check-in.reducer';
import { EffectsModule } from '@ngrx/effects';
import { CheckInEffects } from './+state/check-in.effects';



@NgModule({
  declarations: [],
  imports: [
  StoreModule.forFeature(fromCheckIn.checkInFeatureKey, fromCheckIn.reducer),
  EffectsModule.forFeature([CheckInEffects])]
})
export class CheckInDataAccessModule { }
