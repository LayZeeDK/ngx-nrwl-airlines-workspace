import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ShellComponent } from './shell/shell.component';

const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [],
  },
];

@NgModule({
  declarations: [ShellComponent],
  exports: [RouterModule],
  imports: [
    RouterModule.forRoot(routes),
  ],
})
export class CheckInFeatureShellModule {}
