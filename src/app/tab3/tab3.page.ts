import { Component } from '@angular/core';

import { DataService } from '../services/data.service';
import { UtilService } from '../services/util.service';
import { UserService 	} from '../services/user.service';
import { NetworkService 	} from '../services/network.service';

import { ActivityModalPage 	} from '../components/activity-modal/activity-modal.page';

import { FilterModalComponent 	} from '../components/filter-modal/filter-modal.component';

import { StatsFilterComponent 	} from '../components/stats-filter/stats-filter.component';
import { WriterOptionsComponent 	} from '../components/writer-options/writer-options.component';

import { PostDetailComponent } from '../components/post-detail/post-detail.component';

import { ProfileComponent } from '../components/profile/profile.component';


@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  public notificationsList:any = [];

  constructor(
  	public data: DataService,
  	public util: UtilService,
    public userService: UserService,
  	public networkService: NetworkService
  ) {
  	// console.log(data.users);
  }

  ngOnInit(){

    // this.dropDownOptions(null);
    this.displayNotificationListBySettings();
    /*
      1. Top post of the last day | 1 post as a banner
      2. Daily pick | Next 3 posts from last day with a See all
      3. Announcement from h4t
      4. Category wise Top posts | 1 per Category
      5. New Writers' posts | 1 post per Writer
      6. Weekly Top posts | 5 posts
      7. Monthly Top posts | 5 posts
    */
  }

  displayNotificationListBySettings(){
    this.userService.checkUserNotification(this.userService.currentUserId);
    console.log("FILTER: ", this.userService.userNotificationList.filter(notif => notif.event === "on-follow"))
    this.util.getFromStorage("userSettings").then((userSettingsObj:any)=>{
      // this.userService.userNotificationList.filter((data:any)=>{

      // })
    })
  }

  public openSearch:any;
  // public doRefresh:any;

  openNotification(notification){
    console.log(notification);
    if(notification.event=='new-post'){
      notification.data.post_id = notification.post_id;
      this.openPostDetail(notification.data, [notification.data]);
    } else if (notification.event=='on-follow') {
      this.openProfilePage(notification.data.user);
    } else if (notification.event=='rate-post') {
      this.data.getPostByPostId(notification.data.post_id).then(post=>{
        console.log(post);
        this.openPostDetail(post, [post]);
      });
    } else if (notification.event=='new-comment') {
      this.data.getPostByPostId(notification.data.post_id).then(post=>{
        console.log(post);
        this.openPostDetail(post, [post]);
      });
    }
  }

  openPostDetail(post,postsArray){
    post.headerText = post.title;
    let postData = {
      post:post,
      postsArray:postsArray
    }
    console.log("Tab3Page : openPostDetail() : ", post);
    post.me = false;
    this.util.presentModal(PostDetailComponent, postData, 'PostDetailComponent');
  }

  openProfilePage(item){
    console.log("inside openProfilePage: ",item);
    this.util.presentModal(ProfileComponent,item,'ProfileComponent',false);
  }

  viewWriterInfo(ev: any, writer){
  	let payload:any = {
        list: [
          {
            text: 'Profile',
            callback: 'profile'
          },
          {
            text: 'All Stats',
            callback: 'stats'
          },
          {
            text: 'Report',
            callback: 'report'
          }
        ]
    }
  	this.util.presentPopover(ev, WriterOptionsComponent, payload);
  }

  openFilter(ev: any){
  	let payload:any = {};
  	this.util.presentPopover(ev, StatsFilterComponent, payload);
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

  doRefresh(event){
		console.log("Tab4Page ::doRefresh()");
    setTimeout(() => {
      event.target.complete();
      console.log('Async operation has ended');
    }, 1000);
    this.userService.checkUserNotification(this.userService.currentUserId);
	}

}
