import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ConfirmButtonComponent } from './confirm-button.component';

@NgModule({
  declarations: [ConfirmButtonComponent],
  exports: [ConfirmButtonComponent],
  imports: [
    CommonModule
  ],
})
export class ConfirmButtonModule { }
