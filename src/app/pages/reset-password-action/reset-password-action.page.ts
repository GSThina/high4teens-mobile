import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-reset-password-action',
  templateUrl: './reset-password-action.page.html',
  styleUrls: ['./reset-password-action.page.scss'],
})
export class ResetPasswordActionPage implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
    
  }

}
