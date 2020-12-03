import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResetPasswordActionPageRoutingModule } from './reset-password-action-routing.module';

import { ResetPasswordActionPage } from './reset-password-action.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResetPasswordActionPageRoutingModule
  ],
  declarations: [ResetPasswordActionPage]
})
export class ResetPasswordActionPageModule {}
