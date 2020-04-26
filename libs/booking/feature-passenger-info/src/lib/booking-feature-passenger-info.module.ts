import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  PassengerInfoComponent,
} from './passenger-info/passenger-info.component';

const routes: Routes = [
  {
    path: '',
    component: PassengerInfoComponent,
  },
];

@NgModule({
  declarations: [PassengerInfoComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
  ],
})
export class BookingFeaturePassengerInfoModule { }
