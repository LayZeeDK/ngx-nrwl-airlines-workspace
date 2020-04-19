import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  BookingFeatureShellModule,
} from '@nrwl-airlines/booking/feature-shell';

import { AppComponent } from './app.component';

@NgModule({
  bootstrap: [AppComponent],
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BookingFeatureShellModule,
  ],
})
export class AppModule { }
