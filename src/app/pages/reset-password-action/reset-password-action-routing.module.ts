import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ResetPasswordActionPage } from './reset-password-action.page';

const routes: Routes = [
  {
    path: '',
    component: ResetPasswordActionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResetPasswordActionPageRoutingModule {}
