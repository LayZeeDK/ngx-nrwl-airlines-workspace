import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SeatListingComponent } from './seat-listing/seat-listing.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: SeatListingComponent,
  },
];

@NgModule({
  declarations: [SeatListingComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
  ]
})
export class SeatmapFeatureSeatListingModule { }
