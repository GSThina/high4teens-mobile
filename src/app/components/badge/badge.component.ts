import { Component, OnInit, Input } from '@angular/core';

import { DataService  } from '../../services/data.service';
import { UtilService  } from '../../services/util.service';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss'],
})
export class BadgeComponent implements OnInit {

  @Input() data: any;

  constructor(
    public dataService: DataService,
    public util: UtilService
  ) { }

  public badge:any;
  ngOnInit() {
    this.badge = this.data;
    console.log("Badge: ", this.badge);
  }

}
