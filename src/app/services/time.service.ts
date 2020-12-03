import { Injectable } from '@angular/core';

import * as moment from 'moment';
// import * as moment from "moment";

// const moment = require('moment');

// import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class TimeService {

  public monArray: any = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

  constructor() {
    console.log("Moment Invoked!");
  }

  getTime(time?:string){
    return time?new Date(time):new Date();
  }

  getNextStreakTime(){
    // console.log("TimeService :: nextStreakTimeUpdate() :: moment() :: ", moment().endOf('day').fromNow());
    return moment().endOf('day').fromNow();
  }

  getTodate(){
    console.log(moment().format('DD'));
    return moment().format('DD');
  }

  getDelayedTime(delay, unit){
    console.log(moment().add(delay, unit).toString());
    return moment().add(delay, unit).toString();
  }

}
