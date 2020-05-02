import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import {
  CheckInFeatureShellModule,
} from '@nrwl-airlines/check-in/feature-shell';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    CheckInFeatureShellModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
