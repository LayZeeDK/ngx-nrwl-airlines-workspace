import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookingDataAccessModule } from '@nrwl-airlines/booking/data-access';
import { SharedDataAccessModule } from '@nrwl-airlines/shared/data-access';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'flight-search',
  },
  {
    path: 'flight-search',
    loadChildren: () => import('@nrwl-airlines/booking/feature-flight-search')
      .then(esModule => esModule.BookingFeatureFlightSearchModule),
  },
  {
    path: 'passenger-info',
    loadChildren: () => import('@nrwl-airlines/booking/feature-passenger-info')
      .then(esModule => esModule.BookingFeaturePassengerInfoModule),
  },
];

@NgModule({
  exports: [RouterModule],
  imports: [
    RouterModule.forRoot(routes),
    SharedDataAccessModule,
    BookingDataAccessModule,
  ],
})
export class BookingFeatureShellModule { }
