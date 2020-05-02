import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookingDataAccessModule } from '@nrwl-airlines/booking/data-access';
import { SharedDataAccessModule } from '@nrwl-airlines/shared/data-access';

import { ShellComponent } from './shell/shell.component';

const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'flight-search',
      },
      {
        path: 'flight-search',
        loadChildren: () =>
          import('@nrwl-airlines/booking/feature-flight-search')
            .then(esModule => esModule.BookingFeatureFlightSearchModule),
      },
      {
        path: 'passenger-info',
        loadChildren: () =>
          import('@nrwl-airlines/booking/feature-passenger-info')
            .then(esModule => esModule.BookingFeaturePassengerInfoModule),
      },
      {
        path: 'seatmap',
        loadChildren: () =>
          import('@nrwl-airlines/seatmap/feature-seat-listing')
            .then(esModule => esModule.SeatmapFeatureSeatListingModule),
      },
    ],
  },
];

@NgModule({
  declarations: [ShellComponent],
  exports: [RouterModule],
  imports: [
    RouterModule.forRoot(routes),
    SharedDataAccessModule,
    BookingDataAccessModule,
  ],
})
export class BookingFeatureShellModule { }
