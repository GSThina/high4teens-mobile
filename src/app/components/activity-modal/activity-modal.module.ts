import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ActivityModalPageRoutingModule } from './activity-modal-routing.module';

import { ActivityModalPage } from './activity-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ActivityModalPageRoutingModule
  ],
  declarations: []
})
export class ActivityModalPageModule {}
