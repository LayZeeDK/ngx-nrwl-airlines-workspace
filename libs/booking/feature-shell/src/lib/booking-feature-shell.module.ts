import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookingDataAccessModule } from '@nrwl-airlines/booking/data-access';

const routes: Routes = [];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes),
    BookingDataAccessModule,
  ],
  exports: [RouterModule],
})
export class BookingFeatureShellModule { }
