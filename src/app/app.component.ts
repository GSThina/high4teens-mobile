import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
// import { OneSignal } from '@ionic-native/onesignal/ngx';

import { ApiService } from './services/api.service';
import { UserService } from './services/user.service';
import { DataService } from './services/data.service';
import { UtilService } from './services/util.service';
import { NetworkService } from './services/network.service';
import { PushService } from "./services/push.service";
import { FirebaseService } from "./services/firebase.service";
import { SocketioService } from "./services/socketio.service";

import { environment, SERVER_URL } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private api: ApiService,
    private userService: UserService,
    private dataService: DataService,
    private util: UtilService,
    private pushService: PushService,
    private networkService: NetworkService,
    private socketio: SocketioService,
    private route: ActivatedRoute,
    private router: Router,
    private firebaseService: FirebaseService
    // private oneSignal: OneSignal
  ) {
      // this.networkService.initialize().then(()=>{
      //   console.log("NetworkService Initiated");
      // });
      this.initializeApp();
  }

  // ionViewWillEnter(){
  //
  // }

  ngOnInit(){

  }

  initializeApp() {
    this.platform.ready().then(() => {

      this.statusBar.styleDefault();
      this.splashScreen.hide();

      console.log("Prod: " + environment.production);
      console.log("Server: " + SERVER_URL);
      console.log("Router URL: ", this.router.url);

      this.userService.checkAuthStateToLogin('');
      this.pushService.initialize();
      this.socketio.initialize();
      this.firebaseService.initialize();
      this.networkService.initialize();

      // this.route.queryParams.subscribe(params => {
        // let action = params['action'];
        // let bypass = params['bypass'];
        // this.statusBar.styleDefault();
        // this.splashScreen.hide();
        // console.log("Prod: " + environment.production);
        // console.log("Server: " + SERVER_URL);
        // console.log("Router URL: ", this.router.url);

        // if(action=='reset'){
        //   if(bypass=="true"){
        //     this.userService.checkAuthStateToLogin("password?"+this.router.url.split('?')[1].substr("action=reset".length, this.router.url.split('?')[1].length));
        //   }
        // }else{
        //   this.userService.checkAuthStateToLogin('');
        //   this.pushService.initialize();
        //   this.socketio.initialize();
        //   this.firebaseService.initialize();
        //   this.networkService.initialize();
        // }
      // });
    });
  }

  // setUpPush(){                //onesignal project id                 //firebase project id
  //   this.oneSignal.startInit('4b67f1ab-617b-4239-8d04-599a94ae862f','754698573218');

  //   this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.None);

  //   this.oneSignal.handleNotificationReceived().subscribe((data)=>{
  //     //data.payload.something;

  //   });

  //   this.oneSignal.handleNotificationOpened().subscribe((data)=>{
  //     //data.notification.payload.something;
  //   });

  //   this.oneSignal.endInit();
  // }
}
