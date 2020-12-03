import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';
import { Pipe, PipeTransform } from '@angular/core';

import { PostDetailComponent } from '../components/post-detail/post-detail.component';
import { WriteComponentComponent } from '../components/write-component/write-component.component';
import { WriterOptionsComponent } from '../components/writer-options/writer-options.component';
import { BadgeComponent } from '../components/badge/badge.component';
import { ChartsComponent } from "../components/charts/charts.component";

import { DataService  } from '../services/data.service';
import { UtilService  } from '../services/util.service';
import { UserService 	} from '../services/user.service';
import { NetworkService 	} from '../services/network.service';
import { TimeService 	} from '../services/time.service';

import { GoogleChartInterface } from 'ng2-google-charts';

//
// @Pipe({ name: 'reverse' })
//
// export class ReversePipe implements PipeTransform {
//   transform(value) {
//     return value.slice().reverse();
//   }
// }

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})

export class Tab4Page {

  @ViewChild(IonInfiniteScroll, {static: true}) infiniteScroll: IonInfiniteScroll;
  @ViewChild('barChart') barChart;

	public editable:boolean = false;
	public editableIcon: string = 'create-outline';

  public showSegment:string = 'posts';

  public chart:any;

  public nextStreakTime:any;

  public todate:any;

  public totalRating:number = 0;
  public totalViews:number = 0;
  public totalUniqueViews:number = 0;

  constructor(
  	public data: DataService,
    public util: UtilService,
  	public networkService: NetworkService,
  	public user: UserService,
    public timeService: TimeService
  ) {

  }

  ionViewDidEnter(){
    // console.log("UserData: ", data);
    this.streakUpdate();
    this.calculateUniqueViews();
    this.calculateTotalReach();
    this.calculateTotalRating();
  }

  openStatsModule(){
    this.util.presentModal(ChartsComponent, null, 'ChartsComponent', false);
  }

  ionViewWillEnter() {
    // this.data.getAllPostsById(this.user.userId);
    console.log(this.user.isLoggedIn);
    if(this.user.isLoggedIn&&!this.user.isLoaded){
      this.user.getCurrentUserDetails().then(data => {
        this.user.getCurrentUserStats();
        console.log("UserData: ", data);
        console.log("UserPosts: ", this.user.me.posts);
      });
    } else {
      // this.user.checkAuthStateToLogin('tabs/tab4');
    }
  }

  segmentChanged(ev: any){
    this.showSegment = ev.detail.value;
  }

  toggleEditable(){

  	console.log("Tab4Page ::toggleEditable()");

  	if(this.editable){
  		this.saveProfile();
  		this.editableIcon = 'create-outline'
  	} else {
  		this.editProfile();
  		this.editableIcon = 'save-outline'
  	}

  	this.editable = !this.editable;


  }

  openWriteComponent(){
    console.log("Tab1Page :: openWriteComponent()");

    this.util.presentModal(WriteComponentComponent, {me:true, new: true}, 'WriteComponentComponent');
  }

  editPost(post){
    console.log("Tab1Page :: editPost()");
    post.me = true;
    post.new = false;
    post.status = 'Edit';
    this.util.presentModal(WriteComponentComponent, post, 'WriteComponentComponent');
  }

  openPostDetail(post,postsArray){
    post.headerText = this.user.me.username;
    let postData = {
      post:post,
      postsArray:postsArray
    }
    console.log("Tab2Page : openPostDetail() : ", post);
    post.me = true;
    post.new = false;
    console.log("My Profile", this.user.me.username);
    this.util.presentModal(PostDetailComponent, postData, 'PostDetailComponent',true);
  }

	editProfile(){
		console.log("Tab4Page ::editProfile()");

	}

	saveProfile(){

		console.log("Tab4Page ::editProfile()");


	}

  sharePost(post){
    console.log('Tab4Page : sharePost() : ', post);
    this.util.share('Hey, I recommend you read my post about *' + post.title + '* with High4Teens Community. _','myPost');
  }

	openInbox(){
		console.log("Tab4Page ::openInbox()");
		// push nav
	}

	doRefresh(event){
		console.log("Tab4Page ::doRefresh()");
    setTimeout(() => {
      event.target.complete();
      console.log('Async operation has ended');
    }, 1000);
    this.user.initializeUser();
	}

  editProfilePic(ev: any){
    let payload = {
      isList: true,
      listItems: [
        {
          text: 'Change',
          handler: 'changeUserProfilePic'
        },
        {
          text: 'Remove',
          handler: 'removeUserProfilePic'
        }
      ]
    }
    this.util.presentPopover(ev, WriterOptionsComponent, payload);
  }

  dropDownOptions(ev: any){
    let payload = {
      isList: true,
      listItems: [
        {
          text: 'Edit Profile',
          handler: 'editUserProfile'
        },
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

  openBadgeComponent(ev, badge){
    //ev: any, component, payload, mode?:"ios"
    this.util.presentPopover(ev, BadgeComponent, badge, "md");
  }

  streakUpdate(){
    this.nextStreakTime =  this.timeService.getNextStreakTime();
    this.todate = this.timeService.getTodate();
    console.log(this.todate);

    // console.log("Tab4Page :: nextStreakTimeUpdate() :: this.nextStreakTime :: ", this.nextStreakTime);
  }

  calculateTotalRating(){
    this.totalRating = 0;
    console.log("ChartsComponent :: calculateTotalRating() :: this.user.me.posts :: ", this.user.me.posts);
    for (let i = 0; i < this.user.me.posts.length; i++) {
      for (let j = 0; j < this.user.me.posts[i].rating.length; j++) {
        this.totalRating += this.user.me.posts[i].rating[j]?this.user.me.posts[i].rating[j].value:0;
      }
    }
    console.log(this.totalRating, this.totalUniqueViews);
    this.totalRating = Math.round((this.totalRating/this.totalUniqueViews) * 10) / 10;
  }

  calculateUniqueViews(){
    this.totalUniqueViews = 0;
    this.totalViews = 0;
    for (let i = 0; i < this.user.me.posts.length; i++) {
      let uniqueViewsList = this.util.getUniqueByValue(this.user.me.posts[i].views?this.user.me.posts[i].views:[], (o1, o2) => o1.userid === o2.userid);
      this.totalUniqueViews += uniqueViewsList.length;
      console.log("ChartsComponent :: calculateTotalRating() :: this.totalUniqueViews :: ", this.totalUniqueViews);
      this.totalViews += this.user.me.posts[i].views?this.user.me.posts[i].views.length:0;
    }
  }

  calculateTotalReach(){
    this.totalViews = 0;
    for (let i = 0; i < this.user.me.posts.length; i++) {
      this.totalViews += this.user.me.posts[i].views?this.user.me.posts[i].views.length:0;
    }
  }

}
