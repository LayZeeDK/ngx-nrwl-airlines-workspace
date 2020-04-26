import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FlightSearchComponent } from './flight-search/flight-search.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: FlightSearchComponent,
  },
];

@NgModule({
  declarations: [FlightSearchComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
  ]
})
export class BookingFeatureFlightSearchModule { }
