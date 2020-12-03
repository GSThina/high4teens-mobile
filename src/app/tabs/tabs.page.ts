import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from "../services/user.service";
import { UtilService } from "../services/util.service";

import { WriteComponentComponent } from "../components/write-component/write-component.component";

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(
    private user: UserService,
    private router: Router,
    private util: UtilService
  ) {
    if(!this.user.isLoggedIn){
      this.router.navigateByUrl('/login');
    }
  }

  openWriteComponent(){

    this.util.presentModal(WriteComponentComponent, {me:true, new: true, isQuill: true}, 'WriteComponentComponent', false);
  }

}
