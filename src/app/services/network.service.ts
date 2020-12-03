import { Injectable } from '@angular/core';

import { Network } from '@ionic-native/network/ngx';

import { UtilService } from "./util.service";
//
// import { Platform } from '@ionic/angular';
// import { fromEvent, merge, of, Observable } from 'rxjs';
// import { mapTo } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  public isNetworkAvailable:boolean = true;

  constructor(private network: Network, private util: UtilService) {}

  initialize(){

    let self = this;

    // console.log("NetworkService : isNetworkAvailable : ", this.isNetworkAvailable);

    // watch network for a disconnection
    this.network.onDisconnect().subscribe(() => {
      console.log('network was disconnected :-(');
      self.isNetworkAvailable = false;
      self.util.presentLoading('trying to connect to internet...', 100000000);
      console.log("NetworkService : isNetworkAvailable : ", this.isNetworkAvailable);
    });

    // stop disconnect watch
    // disconnectSubscription.unsubscribe();


    // watch network for a connection
    this.network.onConnect().subscribe(() => {
      console.log('network connected!');
      self.util.dismissLoading();
      console.log("NetworkService : isNetworkAvailable : ", this.isNetworkAvailable);
      self.isNetworkAvailable = true;
      // We just got a connection but we need to wait briefly
       // before we determine the connection type. Might need to wait.
      // prior to doing any api requests as well.
      setTimeout(() => {
        if (this.network.type === 'wifi') {
          console.log('we got a wifi connection, woohoo!');
        }
      }, 3000);
    });

    // stop connect watch
    // connectSubscription.unsubscribe();
  }



}
