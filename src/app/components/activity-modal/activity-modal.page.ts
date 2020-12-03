import { Component, OnInit, Input, ViewChild, ModuleWithComponentFactories } from '@angular/core';
import { ModalController, IonContent } from '@ionic/angular';

import { UtilService } from "../../services/util.service";
import { ActivityService } from "../../services/activity.service";
import { UserService } from "../../services/user.service";
import { ApiService } from "../../services/api.service";
import { PushService } from "../../services/push.service";
import { ScheduleService } from "../../services/schedule.service";
import { SocketioService } from "../../services/socketio.service";
import { TimeService } from '../../services/time.service';
import { WriterOptionsComponent } from '../writer-options/writer-options.component';
import { ProfileComponent } from '../profile/profile.component';
// import { PostDetailComponent } from "../post-detail/post-detail.component";

@Component({
  selector: 'app-activity-modal',
  templateUrl: './activity-modal.page.html',
  styleUrls: ['./activity-modal.page.scss'],
})
export class ActivityModalPage implements OnInit {

	// @Input() data:any;
  public data:any;
  public activity:any = {};
  public placeholderText:string = "";
  public baseLine:string = "";
  public commentText:string = "";
  public commentRepo:any = [];

  public isActivityLoaded:any = false;

  public isMuted:boolean = false;

  @ViewChild('content') content: any;

  constructor(
  	private modalCtrl: ModalController,
    public userService: UserService,
    public api: ApiService,
    public util: UtilService,
    public pushService: PushService,
    public socketio: SocketioService,
    public activityService: ActivityService,
    public schedule: ScheduleService,
    public timeService: TimeService
  ) { }


  ngOnInit() {
    if(this.activityService.currentActivity.type=='pm'){
      this.baseLine = this.activityService.currentActivity.baseline;
      this.placeholderText = "Next line here...(min 4 char)";
    } else if (this.activityService.currentActivity.type=='il'){
      this.placeholderText = "Caption here...(min 4 char)";
    } else if (this.activityService.currentActivity.type=='cyc'){
      this.placeholderText = "Jot your Perspective...(min 4 char)";
    } else {
      this.activityService.currentActivity.type = 'pm';
      this.baseLine = "This is the Base Line";
    }

    this.loadNewComments().then((list)=>{
      this.activityService.commentList = list;
      this.scrollToBottom();
    });

    this.isMuted = false;

    this.socketio.subscribeToRoom(this.activityService.currentActivity.activity_id, this.userService.currentUserId);

    this.socketio.emit('join-activity', {
      full_name: this.userService.me.full_name,
      room: this.activityService.currentActivity.activity_id,
      event: 'join-activity',
      offset: 9
    }); // offset needs to be fetched from local


    // this.pushService.subscribeToTopic(this.activityService.currentActivity.activity_id, 'comment');
    // this.pushService.subscribeToTopic(this.activityService.currentActivity.activity_id, 'onlineStatus');

  }

  scrollToBottom(duration?:number, delay?:number) {
      setTimeout(() => {
          if (this.content.scrollToBottom) {
              this.content.scrollToBottom(duration?duration:500);
              this.activityService.isNewComment = false;
          }
      }, delay?delay:250);
  }

  scrollToTop(duration?:number, delay?:number) {
      setTimeout(() => {
        console.log(this.content);
          if (this.content.scrollToTop) {
              this.content.scrollToTop(duration?duration:500);
          }
      }, delay?delay:250);
  }

  muteActivityToggle(){
    this.isMuted = !this.isMuted;
    if(this.isMuted){
      this.socketio.unSubscribeFromRoom(this.activityService.currentActivity.activity_id, this.userService.currentUserId);
    } else {
      this.socketio.subscribeToRoom(this.activityService.currentActivity.activity_id, this.userService.currentUserId);
    }
  }


  ionViewWillLeave(){
    this.socketio.unSubscribeFromRoom(this.activityService.currentActivity.activity_id, this.userService.currentUserId);
    this.socketio.emit('leave-activity', {
      full_name: this.userService.me.full_name,
      event: this.activityService.currentActivity.activity_id,
      offset: 9
    });
  }

  updateCommentText(ev:any){
  	this.commentText = ev.target.value;
  }


  // loadNewComments(){
  //   // this.util.presentLoading('Loading comments...');
  //   // this.api.get('')
  //   this.util.presentLoading('Loading comments');
  //   this.api.post('getAllCommentsByActivityId', {activity_id:this.activityService.currentActivity.activity_id}).subscribe(res=>{
  //     console.log(res);
  //     let list = [];
  //
  //     // let emptyList = [];
  //     // res[0].comments = (res[0].comments == undefined)?(emptyList):(res[0].comments)
  //     for (let i = 0; i < res[0].comments.length; i++) {
  //       list.push(res[0].comments[i]);
  //       // this.commentRepo.push(res[0].comments[i]);
  //     }
  //     this.activityService.commentList = list;
  //     // this.loadMoreComments();
  //     this.isActivityLoaded = true;
  //     this.util.dismissLoading();
  //   });
  // }

  loadNewComments(){

    return new Promise((resolve, reject)=>{

      // this.util.presentLoading('Loading comments...');
      // this.api.get('')
      this.util.presentLoading('Loading comments');
      this.api.post('getAllCommentsByActivityId', {activity_id:this.activityService.currentActivity.activity_id}).subscribe(res=>{
        console.log(res);
        let list = [];
         res[0].comments = (res[0].comments == undefined)?[]:res[0].comments
        for (let i = 0; i < res[0].comments.length; i++) {
          console.log("user: ",this.userService.currentUserId);
          res[0].comments[i].vote = (res[0].comments[i].vote == undefined)?[]:res[0].comments[i].vote;
          res[0].comments[i].userVoted = (res[0].comments[i].vote!=undefined)?(res[0].comments[i].vote.find(o => o.userid === this.userService.currentUserId)!=undefined?(res[0].comments[i].vote.find(o => o.userid === this.userService.currentUserId).voteValue=='up'?true:false):false):false;
          if(res[0].comments[i].vote!=undefined){
            for (let v = 0; v < res[0].comments[i].vote.length; v++) {
              if(res[0].comments[i].vote[v].voteValue == 'up'){
                res[0].comments[i].votesCount = isNaN(res[0].comments[i].votesCount)?1:res[0].comments[i].votesCount+1;
              }
            }
          }
          console.log("userVoted: ",res[0].comments[i].userVoted)
          list.push(res[0].comments[i]);
        }

        resolve(list);

        // this.loadMoreComments();
        this.isActivityLoaded = true;
        this.util.dismissLoading();
      })
    });
  }

  // loadMoreComments(event){
  //
  //   if(this.commentRepo.length<5){
  //     for (let i = 0; i < this.commentRepo.length; i++) {
  //       this.commentRepo[this.activityService.commentList.length].user?this.activityService.commentList.push(this.commentRepo[this.activityService.commentList.length]):event.target.disabled = true;;
  //     }
  //     event.target.disabled = true;
  //     this.activityService.commentList = this.commentRepo;
  //   } else {
  //     setTimeout(() => {
  //       console.log('Done');
  //       for (let i = 0; i < 5; i++) {
  //         this.commentRepo[this.activityService.commentList.length].user?this.activityService.commentList.push(this.commentRepo[this.activityService.commentList.length]):event.target.disabled = true;;
  //       }
  //       this.activityService.commentList = this.commentRepo;
  //       event.target.complete();
  //
  //       // App logic to determine if all data is loaded
  //       // and disable the infinite scroll
  //       if (this.activityService.commentList.length >= this.commentRepo.length) {
  //         event.target.disabled = true;
  //       }
  //     }, 1000);
  //   }
  // }

  addNewComment(){

    // if(this.commentText.indexOf('schedule')!=-1){
    //   this.schedule.scheduleLater(this.commentText, new Date(new Date().getTime() + 3600));
    // }

    this.activityService.wasRecentComment = true;

    let comment:any = {
    	activity_id: this.activityService.currentActivity.activity_id,
    	text: this.commentText,
      userid: this.userService.currentUserId,
      time: this.timeService.getTime()
    }

    this.activityService.disableComment = true;
    this.activityService.runTimerFor(30);

    this.api.post('addCommentByActivityId', comment).subscribe((commentRes:any)=>{
      console.log("Comment Added: ", commentRes);
      comment.user = {
        profile_picture : this.userService.me.profile_picture,
        full_name : this.userService.me.full_name,
        userid: this.userService.currentUserId
      };
      comment.comment_id=commentRes.comment_id;

      this.activityService.commentList.push(comment);

      this.scrollToBottom();

      this.socketio.emit('new-comment', {
      	room: this.activityService.currentActivity.activity_id,
      	data: comment,
        userid: this.userService.currentUserId,
        event: 'new-comment'
      });

      this.commentText = '';
      this.activityService.disableComment = false;
      // // this.util.presentToast('Responded!', 'You can comment in ' + this.util.timer + ' seconds!', 3000);
      // for (let index = 0; index < this.activityService.currentActivity.participants.length; index++) {
      //   console.log(this.activityService.currentActivity.participants[index].userid, this.userService.currentUserId);
      //   if(this.activityService.currentActivity.participants[index].userid!=this.userService.currentUserId){
      //     isNewParticipant = true;
      //   } else {
      //     isNewParticipant = false;
      //   }
      // }
      let found = this.activityService.currentActivity.participants.find(o => o.userid === this.userService.currentUserId);// && o.subtype === ritemlist[k].type)

      // DUMMY UI UPDATE BEFORE SAVING TO SERVER

      this.activityService.activitiesList[this.activityService.activitiesList.findIndex(o => o.activity_id === this.activityService.currentActivity.activity_id)].comments.push(comment);

      // DUMMY UI UPDATE ENDS

      if (found === undefined){
        this.activityService.activitiesList[this.activityService.activitiesList.findIndex(o => o.activity_id === this.activityService.currentActivity.activity_id)].participants.push(found);
        this.api.post('addParticipantByActivityId', {activity_id: comment.activity_id, userid: comment.userid}).subscribe((participantRes:any)=>{
          console.log("New Participant: ", participantRes);
        });
      } else {
        console.log("Existing participant: ", found);
      }
      // this.toggleCommentBox();
      this.util.presentToast(null, 'You can comment in 30 seconds', 2000);
    });
  }

  // editVoteByCommentId(comment){
  //   console.log("ActivityModalPage : editVoteByCommentId() : comment: ", comment);
  //   this.api.put('editVoteByCommentId', {
  //     userid : comment.userid,
  //     comment_id : comment.comment_id,
  //     activity_id : comment.activity_id,
  //     voteValue : 'up'
  //   }).subscribe((voteRes:any)=>{
  //     (voteRes.status==200)?console.log(voteRes.text):console.log(voteRes.text);
  //   })
  //   // let obj = {
  //   //   userid: this.userService.currentUserId,
  //   //   comment_id: ,
  //   //   activity_id: ,
  //   //   voteValue:
  //   // }
  // }

  dropDownOptions(userid,comment_id,id,ev?:any){
     console.log("inside the dropDown function: ",ev,"//",userid,"//",comment_id,"//",id);

     // console.log("commentList.userid: ",this.activityService.commentList.find(o => o.userid === this.userService.currentUserId))
        if(userid == this.userService.currentUserId){
          console.log("the userid's match, inside the if condition");
          //this.queryResult.push(this.activityService.commentList[i].comment_id);
          // let payload = {
          //   isDeleteComment:true,
          //   listItems: [
          //         {
          //         text:"Delete",
          //         handler:"deleteComment",
          //         iconName:"trash-outline"
          //       },
          //       {
          //         text:"Edit",
          //         handler:"editComment",
          //         iconName:"create"
          //       }
          //    ]
          //  }
          // this.util.presentPopover(ev,WriterOptionsComponent,payload);
          let buttons = [
            // {
            //   text: 'Edit',
            //   cssClass: 'secondary',
            //   handler: () => {
            //     console.log('editFunction called');
            //     this.editComment();
            //   }
            // },
            {
              text: 'Delete',
              role:'destroy',
              cssClass: 'danger',
              handler: () => {
                console.log('deleteFunction called');
                this.deleteComment(comment_id,id);
              }
            }
          ]
          this.util.presentAlert("","Are you sure ?",buttons," ")
        }
        else{
          console.log("the userid's do not match, inside the else condition");
        }
  }
  deleteComment(comment_id,id){
   console.log("inside the deleteComment function",comment_id);
   // this.util.presentAlert('You cannot delete this comment');
   // if(this.activityService.wasRecentComment){
   //   this.api.delete('deleteCommentByCommentId?comment_id='+comment_id+'&id='+id,"").subscribe((res:any)=>{
   //     console.log("response of delete function is: ",res);
   //     if(res.status == 200){
   //       console.log("check: ",this.activityService.activitiesList)
   //      // let findActivity = this.activityService.activitiesList.find(o => o.activity_id === id);
   //       let commentIndex = this.activityService.activitiesList.find(o => o.activity_id === id).comments.findIndex(o => o.comment_id === comment_id);
   //       console.log("commentIndex: ",commentIndex);
   //       this.activityService.activitiesList.find(o => o.activity_id === id).comments.splice(commentIndex,1);
   //       let commentListIndex = this.activityService.commentList.findIndex(o => o.comment_id === comment_id);
   //       console.log("commentList index: ",commentListIndex);
   //       this.activityService.commentList.splice(commentListIndex,1);
   //     }
   //   });
   // } else {
   //   console.log("You cannot delete old comments");
   // }
  }

  openProfilePage(item){
    console.log("inside openProfilePage: ",item);
    this.util.presentModal(ProfileComponent,item,'ProfileComponent',false);
  }

  editComment(){
    console.log("inside the editComment function");
  }

  editVoteByCommentId(comment){
    console.log("ActivityModalPage : editVoteByCommentId() : comment: ", comment);
    comment.userVoted=!comment.userVoted;
    comment.votesCount = comment.userVoted?(isNaN(comment.votesCount)?1:comment.votesCount+1):isNaN(comment.votesCount)?0:comment.votesCount-1;
    this.api.put('editVoteByCommentId', {
      userid : this.userService.currentUserId,
      comment_id : comment.comment_id,
      activity_id : comment.activity_id,
      voteValue : comment.userVoted?'up':'down'
    }).subscribe((voteRes:any)=>{
      (voteRes.status==200)?console.log(voteRes.text):console.log(voteRes.text);
    })
    // let obj = {
    //   userid: this.userService.currentUserId,
    //   comment_id: ,
    //   activity_id: ,
    //   voteValue:
    // }
  }

  shareActivity(){
    console.log('ActivityModalPage : shareActivity() : ', this.activityService.currentActivity);
    this.util.share('Hello, do you know someone who may be interested in *' + this.activityService.currentActivity.title + '*\n','');
  }

  showInfo(){
    console.log('ActivityModalPage : showInfo() : ', this.activity);
    this.util.presentInfo(this.activityService.currentActivity.title, this.activityService.currentActivity.description, 'For ' + this.activityService.currentActivity.category);
  }

  // addNewComment(text){
  //   let card = {
  //     style: 'myLineCard',
  //     text: text,
  //     username: 'G Surendar Thina', // this.userService.me.full_name
  //     imgSrc: this.activityService.currentActivity.media.thumbnail.url,
  //     votes: {
  //       up: 0,
  //       down: 0
  //     }
  //   }
  //   this.commentRepo.push(card);
  //   this.commentText = '';
  // }

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    // this.pushService.unSubscribeFromChannel(this.activityService.currentActivity.activity_id);
    this.activityService.commentList = [];
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

}
