import { Injectable } from '@angular/core';

import { LocalNotifications } from '@ionic-native/local-notifications/ngx';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  constructor(private localNotifications: LocalNotifications) { }

  scheduleSingle(){
    console.log("ScheduleService :: scheduleSingle() :: START");

    // Schedule a single notification
    this.localNotifications.schedule({
      id: 1,
      text: 'Single ILocalNotification',
      // sound: isAndroid? 'file://sound.mp3': 'file://beep.caf',
      // data: { secret: key }
    });

    console.log("ScheduleService :: scheduleSingle() :: END");
  }

  scheduleMultiple(){
    console.log("ScheduleService :: scheduleMultiple() :: START");

    // Schedule multiple notifications
    this.localNotifications.schedule([{
       id: 1,
       text: 'Multi ILocalNotification 1',
       // sound: isAndroid ? 'file://sound.mp3': 'file://beep.caf',
       // data: { secret:key }
      },{
       id: 2,
       title: 'Local ILocalNotification Example',
       text: 'Multi ILocalNotification 2',
       icon: 'http://example.com/icon.png'
    }]);

    console.log("ScheduleService :: scheduleMultiple() :: END");
  }

  scheduleLater(text, at){
    console.log("ScheduleService :: scheduleLater() :: START");

    // Schedule delayed notification
    this.localNotifications.schedule({
       text: text,
       trigger: {at: at},
       led: 'FF0000',
       sound: null
    });

    console.log("ScheduleService :: scheduleLater() :: END");
  }

}
