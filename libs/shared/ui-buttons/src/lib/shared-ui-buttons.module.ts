import { NgModule } from '@angular/core';

import { ConfirmButtonModule } from './confirm-button/confirm-button.module';

@NgModule({
  exports: [
    ConfirmButtonModule,
  ],
})
export class SharedUiButtonsModule { }
