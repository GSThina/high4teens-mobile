import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ActivityModalPage } from './activity-modal.page';

const routes: Routes = [
  {
    path: '',
    component: ActivityModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActivityModalPageRoutingModule {}
