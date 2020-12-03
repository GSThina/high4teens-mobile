import { Component, OnInit } from '@angular/core';

import { DataService } from '../../services/data.service';
import { PushService } from '../../services/push.service';
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'app-notifications-modal',
  templateUrl: './notifications-modal.component.html',
  styleUrls: ['./notifications-modal.component.scss'],
})
export class NotificationsModalComponent implements OnInit {

  // public list:any = [];

  constructor(
  	private util: UtilService,
  	private data: DataService,
    public pushService: PushService
  ) { }

  ngOnInit() {}

  viewAllNotifications(){
  	console.log('View all notifications');
  }

}
