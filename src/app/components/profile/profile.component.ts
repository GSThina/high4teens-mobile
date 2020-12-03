import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';

import { UserService } from '../../services/user.service';
import { UtilService } from '../../services/util.service';
import { PostDetailComponent } from '../post-detail/post-detail.component';
import { DataService } from '../../services/data.service';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {

  public userDetails:any = this.nav.get('data');
  public showSegment:string = 'posts';
  public isUserFollowing:boolean = true;

  constructor(
    public user:UserService,
    public util:UtilService,
    public nav:NavParams,
    public dataService:DataService
  ) { }

  ngOnInit() {
    this.user.otherUser = {
      userid: '',
      posts:[],
      stats:[]
    }

    console.log("you are using the profilecomponent",this.userDetails);
    this.util.presentLoading('Loading user...');
    this.user.getUserDetailsByUSerid(this.userDetails.userid).then(()=>{
      this.user.getAllPostsByUserid(this.userDetails.userid);
      this.user.getStatsByUserid(this.userDetails.userid);
      this.util.dismissLoading();
    });

    console.log("Checking user follow status");
    this.user.checkFollowingStatus(this.user.currentUserId,this.userDetails.userid);
  }

  segmentChanged(ev: any){
    this.showSegment = ev.detail.value;
  }

  openPostDetail(post,postsArray){
    post.headerText = post.category;
    let postsData = {
      post:post,
      postsArray:postsArray
    }
    console.log("ProfileComponent : openPostDetail() : ", post);
    console.log("OtherUSer Profile", this.user.otherUser.username);
    this.util.presentModal(PostDetailComponent, postsData, 'PostDetailComponent',true);
  }

  sharePost(post){
    console.log('Tab4Page : sharePost() : ', post);
    // this.util.share('Hey, do check my post about *' + post.title + '*\n _-By ' + post.user.full_name + '_','');
    this.util.share('Hey, this post about *' + post.title + '*\n _-By ' + post.user.full_name + ' looks great. You will love the content. _','otherPost');
  }

  checkForFollowing(){
    console.log("inside checkForFollowing function");
    // this.user.checkFollowingStatus(this.user.currentUserId,this.userDetails.userid);
    if(!this.user.isUserFollowing){
      this.user.followUser(this.user.currentUserId,this.userDetails.userid);
      
    }else{
      this.user.unfollowUser(this.user.currentUserId,this.userDetails.userid);      
    }
  }

  dismiss(ev?:any){
    this.util.dismissModal(this);
  }

}
