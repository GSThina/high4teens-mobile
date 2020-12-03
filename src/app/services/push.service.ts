import { Injectable } from '@angular/core';
// import { Push, PushObject, PushOptions } from '@ionic-native/push/ngx';
// import 'phonegap-plugin-push/types';

import * as Pusher from '../../assets/pusher.min.js';
// import * as OneSignal from '../../assets/OneSignalSDK.js';
// import * as OneSignal from 'https://cdn.onesignal.com/sdks/OneSignalSDK.js';

import { ApiService } from './api.service';
import { UtilService } from './util.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class PushService {

  // private pusher:Pusher = new Pusher('f1f6b680978c647447be', {
  //   cluster: 'ap2'
  // });

  // private OneSignal:any;

  public notificationList:any = [];

  public channel:string = "";

  constructor(
    private api: ApiService,
    private util: UtilService,
    public userService: UserService
  ) {
    // this.push.hasPermission().then((res: any) => {
    //
    //   if (res.isEnabled) {
    //     console.log('We have permission to send push notifications');
    //   } else {
    //     console.log('We do not have permission to send push notifications');
    //   }
    //
    // });
  }

  initialize(){

    // this.OneSignal = window['OneSignal'] || [];
    // console.log("OneSignal: ", this.OneSignal);
    // OneSignal.push(function() {
    //   console.log("OneSignal.push: ", OneSignal);
    //   OneSignal.init({
    //     appId: "b3eacd9e-05ad-4594-9881-2e93c4a74283",
    //   });
    // });

    // // Enable pusher logging - don't include this in production
    // Pusher.logToConsole = true;
    //
    // this.util.getFromStorage('currentUserId').then((id:any)=>{
    //   this.subscribeToTopic(id, 'notifications');
    // });
  }

  subscribeToTopic(channel, topic){

    console.log("Subscribing to topic: ", topic, " via ", channel);
    //
    // let self = this;
    //
    // this.pusher.subscribe(channel).bind(topic, function(data:any) {
    //   // console.log(JSON.stringify(data));
    //   console.log(data);
    //
    //   if(data.topic=='comment'&&data.payload.userid!=self.userService.currentUserId){
    //     self.showAsToast(data);
    //   }

      // self.notificationList.push(data.payload);
    // });
  }

  showAsToast(data){
    this.util.presentToast(data.payload.user.full_name + " says, ", "'" + data.payload.text + "'", 3000);
  }

  unSubscribeFromChannel(channel){
    console.log("Unsubscribing ", channel);

    // this.pusher.unsubscribe(channel);
  }

  send(data){
    // this.api.post('sendPusher', data).subscribe((ack:any)=>{
    //   console.log(ack);
    // })
  }

  getAllNotifications(){

  }



  //
  // TEMPinitialize(){
  //   // to initialize push notifications
  //
  //   const options: PushOptions = {
  //      android: {},
  //      ios: {
  //          alert: 'true',
  //          badge: true,
  //          sound: 'false'
  //      },
  //      windows: {},
  //      browser: {
  //          pushServiceURL: 'http://push.api.phonegap.com/v1/push'
  //      }
  //   }
  //
  //   const pushObject: PushObject = this.push.init(options);
  //
  //
  //   pushObject.on('notification').subscribe((notification: any) => console.log('Received a notification', notification));
  //
  //   pushObject.on('registration').subscribe((registration: any) => console.log('Device registered', registration));
  //
  //   pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));
  //
  // }
  //
  // createChannel(){
  //   // Create a channel (Android O and above). You'll need to provide the id, description and importance properties.
  //   this.push.createChannel({
  //    id: "testchannel1",
  //    description: "My first test channel",
  //    // The importance property goes from 1 = Lowest, 2 = Low, 3 = Normal, 4 = High and 5 = Highest.
  //    importance: 3
  //   }).then(() => console.log('Channel created'));
  // }
  //
  // deleteChannel(){
  //   // Delete a channel (Android O and above)
  //   this.push.deleteChannel('testchannel1').then(() => console.log('Channel deleted'));
  // }
  //
  // listChannels(){
  //   // Return a list of currently configured channels
  //   this.push.listChannels().then((channels) => console.log('List of channels', channels));
  // }


}
