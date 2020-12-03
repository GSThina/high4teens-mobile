import { Component, ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import { Platform } from '@ionic/angular';

import { ActivityModalPage 	} from '../components/activity-modal/activity-modal.page';
import { NotificationsModalComponent 	} from '../components/notifications-modal/notifications-modal.component';
import { FilterModalComponent 	} from '../components/filter-modal/filter-modal.component';
import { WriteComponentComponent } from '../components/write-component/write-component.component';
import { WriterOptionsComponent } from '../components/writer-options/writer-options.component';
import { PostDetailComponent } from '../components/post-detail/post-detail.component';

import { ApiService	} from '../services/api.service';
import { DataService	} from '../services/data.service';
import { UserService 	} from '../services/user.service';
import { UtilService 	} from '../services/util.service';
import { EditorService} from '../services/editor.service';
import { NetworkService} from '../services/network.service';
import { ActivityService} from '../services/activity.service';
import { SocketioService} from '../services/socketio.service';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

	@ViewChild(IonInfiniteScroll, {static: true}) infiniteScroll: IonInfiniteScroll;

  constructor(
    private api: ApiService,
  	public data: DataService,
  	private userService: UserService,
    private editorService: EditorService,
  	public util: UtilService,
    public activityService: ActivityService,
    public networkService: NetworkService,
  	public popoverController: PopoverController,
    public socketioService: SocketioService,
    public platform:Platform
  ) {

  }
  public announcement:any;
  public openAnnouncement:any;
  public activity:any;

  public announcementSliderOptions:any = {};

  ngOnInit(){
    // this.openActivity('cyc', '../../assets/img/cyc-tea.jpg');
    this.userService.initializeUser();
    this.infiniteScroll.disabled = true;
    // this.userService.checkAuthStateToLogin(this.userService);
    // this.openWriteComponent();
    this.util.presentLoading('Loading activities...');
    this.activityService.getAllActivities().then((activities:any)=>{
      console.log("Here are the activity's responses: ",activities)
      this.util.dismissLoading();
    });

    // this.openActivity(this.activitiesList[0], this.activitiesList[0].media.thumbnail.url);

    this.announcementSliderOptions = {
      speed: 1000
    }
  }

  doRefresh(event) {

    console.log('Begin async operation');

    // this.activityService.getAllActivities().subscribe(()=>{
    //
    // })

    this.activityService.getAllActivities().then((activities:any)=>{
      event.target.complete();
    });

    // setTimeout(() => {
    //   console.log('Async operation has ended');
    //   event.target.complete();
    // }, 2000);

  }

  loadData(event) {
    setTimeout(() => {
      console.log('Done');
      event.target.complete();

      // App logic to determine if all data is loaded
      // and disable the infinite scroll
      if (this.data.posts.length == 1000) {
        event.target.disabled = true;
      }
    }, 500);
  }

  toggleInfiniteScroll() {
    this.infiniteScroll.disabled = !this.infiniteScroll.disabled;
  }

  openActivity(activity, image){
  	// console.log('openActivity :: ', activity);
    // if(image){
      // this.data.activityObj.media.thumbnail.url = image;
    // }
    // this.data.activityObj.type = activity.type;
    // let payload:any = this.data.activityObj;
    if(activity.type=='dt'){
      console.log('Daily Post');
      let payload = {title: activity.title, me:true, new: true};
      this.openWriteComponent(payload);
    } else {
      this.activityService.setCurrentActivity(activity).then(()=>{
        this.util.presentModal(ActivityModalPage);
      });
    }
  }

  openFilter(ev: any){
    console.log("openFilter Event: ",ev);
    let payload:any = {};
  	this.util.presentPopover(ev, FilterModalComponent, payload);
  }

  openNotifications(ev: any){
    let payload:any = {};
    // this.util.presentPopover(ev, NotificationsModalComponent, payload);
  	this.util.presentModal(NotificationsModalComponent, payload, 'NotificationsModalComponent');
  }

  openWriteComponent(payload){
    console.log("Tab1Page :: openWriteComponent()");

    this.editorService.initializeEditor();

    this.util.presentModal(WriteComponentComponent, payload, 'WriteComponentComponent', false);
  }

  dropDownOptions(ev: any){
    let payload = {
      isList: true,
      listItems: [
        {
          text: 'Settings',
          handler: 'openSettingsPage'
        }, {
          text: 'Logout',
          handler: 'logout'
        }
      ]
    }
    this.util.presentPopover(ev, WriterOptionsComponent, payload);
  }

  shareActivity(){

    console.log('ActivityModalPage : shareActivity() : ', this.activityService.currentActivity);
    this.util.share('Hello, do you know someone who may be interested in *' + this.activityService.currentActivity.title + '*\n','');
  }

	// async presentModal(component, params) {
 //    const modal = await this.modalController.create({
 //      component: component,
 //      componentProps: params
 //    });
 //    return await modal.present();
  // }

}
