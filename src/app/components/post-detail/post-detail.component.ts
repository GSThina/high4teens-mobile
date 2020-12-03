import { Component, OnInit, Input, ViewChild } from '@angular/core';

import { WriteComponentComponent } from '../write-component/write-component.component';
// import { ProfileComponent } from '../profile/profile.component';

import { ApiService   } from '../../services/api.service';
import { UtilService   } from '../../services/util.service';
import { UserService   } from '../../services/user.service';
import { EditorService } from '../../services/editor.service';
import { DataService } from '../../services/data.service';
import { SocketioService } from '../../services/socketio.service';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss'],
})
export class PostDetailComponent implements OnInit {

	@Input() data: any;

  public post:any;

  public isPrivateFlag:boolean =  false;

  public privateFlagStatus:string = 'eye-outline';

  public isLoaded:boolean = false;

  public isCommentBoxOpen:boolean = false;

  public commentBoxToggleIcon:string = "chatbox-outline";

  public commentText:string = "";

  public commentList:any = [];

  public currentPostIndex:number = 0;

  constructor(
    private api: ApiService,
    public util: UtilService,
    public userService: UserService,
    public dataService: DataService,
    public editorService: EditorService,
    public socketio: SocketioService
    ) {

  }

  ngOnInit() {
    // this.post = this.data;

    // console.log("PostDetailComponent : ngOnInit() : ", this.data, this.userService, (this.data.post.userid==this.userService.currentUserId));
    // this.getPostByPostId(this.data.post.post_id);
    // (this.userService.currentUserId!=this.data.post.userid)?this.incrementViewsByPostId(this.data.post.post_id):console.log("viewing your own post");
    // this.loadNewComments();
    this.currentPostIndex = this.data.postsArray.findIndex((post) => post.post_id === this.data.post.post_id);
    this.viewPost(this.currentPostIndex);
  }

  viewPost(index){
    this.commentList = [];
    this.commentRepo = [];
    this.getPostByPostId(this.data.postsArray[index].post_id);
    (this.userService.currentUserId!=this.data.postsArray[index].userid)?this.incrementViewsByPostId(this.data.postsArray[index].post_id):console.log("viewing your own post");
    this.loadNewComments();
    console.log("Inside viewPost function");
  }
  public myRating:number = 0;
  public viewsCount:number = 0;
  // public postIdList:any = [];


  swipeToPreviousPost(ev:any){    // swipeleft

        console.log("Event triggered is: ",ev.type);
        console.log("Length of posts array is: ",this.data.postsArray.length);
        console.log("Post Index before Swipe left: ",this.currentPostIndex );
        if(this.currentPostIndex == this.data.postsArray.length-1){
          //make an alert saying this is the latest post
          console.log("You are viewing the latest post");
          this.util.presentAlert("You are viewing the latest post","Try swiping left");
        }else{
          this.currentPostIndex +=1;
          console.log("Post Index after Swipe left: ",this.currentPostIndex );
          this.viewPost(this.currentPostIndex);
        }
  }

  swipeToNextPost(ev:any){  //swiperight

      console.log("Event triggered is: ",ev.type);
      console.log("Length of posts array is: ",this.data.postsArray.length);
      console.log("Post Index before Swipe right: ",this.currentPostIndex );
      if(this.currentPostIndex == 0){
        //make an alert saying this is the oldest post
        console.log("You are viewing the oldest post");
        this.util.presentAlert("You are viewing the oldest post","Try swiping right");
      }else{
        this.currentPostIndex -=1;
        console.log("Post Index after Swipe right: ",this.currentPostIndex );
        this.viewPost(this.currentPostIndex);
      }
  }

  getPostByPostId(id){
   // this.util.presentLoading('loading post...',2000);
    this.api.post('getPostByPostId', {post_id: id}).subscribe(response=>{
      this.post = response[0];
      console.log(this.post);
      // this.addTagsFromDescription(this.post.description.content);
      this.isLoaded = true;
      this.myRating = this.post.rating?(this.post.rating.find(o => o.user.userid === this.userService.currentUserId)!=undefined?this.post.rating.find(o => o.user.userid === this.userService.currentUserId).value:0):0;
      console.log(this.myRating);
      // if(this.post.userid === this.userService.currentUserId){

      // }
      //this.util.dismissLoading();
    });
  }

  addTagsFromDescription(content){
    if(!this.post.isQuill)
      if(content.indexOf('#')!=-1)
        content.split('#').forEach(element => {
          // console.log('#'+element.split(' ')[0]);
          this.post.tags.push(element.split(' ')[0]);
        });
  }

  editPost(post){
    console.log("Edit :: ", post);
    post.me = true;
    this.editorService.editor.new = false;
    this.editorService.editor.status = 'Edit';
    this.util.presentModal(WriteComponentComponent, post, 'WriteComponentComponent');
  }

  @ViewChild('post') feed: any;

  toggleCommentBox(){
    this.commentBoxToggleIcon = this.isCommentBoxOpen?'chatbox-outline':'chatbox-ellipses-outline';
    this.isCommentBoxOpen = !this.isCommentBoxOpen;
    // if(this.isCommentBoxOpen){
    //   this.scrollToBottom();
    // } else {
    //   this.scrollToTop();
    // }
  }

  scrollToTop(duration?:number) {
      setTimeout(() => {
          if (this.feed.scrollToTop) {
              this.feed.scrollToTop(500);
          }
      }, duration?duration:500);
  }

  scrollToBottom(duration?:number) {
      setTimeout(() => {
          if (this.feed.scrollToBottom) {
              this.feed.scrollToBottom(500);
          }
      }, duration?duration:500);
  }

  updateNextLine(ev:any){
  	this.commentText = ev.target.value;
  }

  public commentRepo:any = [];

  loadNewComments(){
    // this.util.presentLoading('Loading comments...');
    // this.api.get('')
    // this.commentList = results
    this.util.presentLoading('Loading comments');
    // console.log("loadNewComments data: ",this.data);
    this.api.post('getAllCommentsByPostId', {post_id:this.data.postsArray[this.currentPostIndex].post_id}).subscribe((res:any)=>{
      // console.log("Response of getAllCommentsByPostId: ",res);
      for (let i = 0; i < res.length; i++) {
        // this.commentRepo.push(res[i]);
        if(this.userService.currentUserId == this.data.postsArray[this.currentPostIndex].userid){
          this.commentRepo.push(res[i]);
        }else if(res[i].userid == this.userService.currentUserId){
          this.commentRepo.push(res[i]);
        }else if(!res[i].isPrivateFlag){
          this.commentRepo.push(res[i]);
        }
      }
      // this.commentList = this.commentRepo;
      // this.loadMoreComments(null);
      this.util.dismissLoading();
    });
  }

  loadMoreComments(event){

    if(this.commentRepo.length<5){
      for (let i = 0; i < this.commentRepo.length; i++) {
        this.commentRepo[this.commentList.length].user?this.commentList.push(this.commentRepo[this.commentList.length]):event.target.disabled = true;;
      }
      event.target.disabled = true;
      // this.commentList = this.commentRepo;
      event.target.complete();
    } else {
      setTimeout(() => {
        console.log('Done');
        for (let i = 0; i < 5; i++) {
          this.commentRepo[this.commentList.length]?this.commentList.push(this.commentRepo[this.commentList.length]):event.target.disabled = true;;
        }
        event.target.complete();

        // App logic to determine if all data is loaded
        // and disable the infinite scroll
        if (this.commentList.length >= this.commentRepo.length) {
          event.target.disabled = true;
        }
      }, 1000);
    }
  }

  setPrivateFlag(){
    this.privateFlagStatus = (this.isPrivateFlag)?'eye-outline':'eye-off-outline';
    this.isPrivateFlag = !this.isPrivateFlag;
  }

  addNewComment(text){
    console.log(this.userService);
    console.log("Private flag Status: ",this.isPrivateFlag);
    let comment:any = {
    	post_id: this.post.post_id,
    	text: text,
      userid: this.userService.currentUserId,
      isPrivateFlag: this.isPrivateFlag
    }
    this.api.post('addCommentByPostId', comment).subscribe((res:any)=>{
      comment.user = {
        profile_picture : this.userService.me.profile_picture,
        full_name : this.userService.me.full_name,
        userid : this.userService.currentUserId
      };
      // this.commentRepo.push(comment);
      if(this.commentRepo.length%5!=0){
        this.commentList.push(comment)
      }else if(this.commentList.length>=this.commentRepo.length){
        console.log("commentlist is greater");
          this.commentList.push(comment);
      }else{
        this.commentRepo.push(comment);
      }
      this.commentText = '';
      this.toggleCommentBox();
      this.util.runTimerFor(5);

      this.util.presentToast('Responded!', 'You can comment in ' + this.util.timer + ' seconds!', 3000);
      if(this.userService.currentUserId!=this.post.userid && res.status == 200){
        //subscribing to post and calling event new comment.
        //if condition to check if setting applied or not
        this.util.getFromStorage("userSettings").then((userSettingsObj:any)=>{
          console.log("User Config: ", userSettingsObj);
            this.socketio.subscribeToRoom(comment.post_id,this.userService.currentUserId);
              this.socketio.emit("new-comment",{
                room:comment.post_id,
                data:comment,        // contains userid of current user
                userid:this.post.userid,  // userid of post creator
                event:"new-comment",
                userOnCommentSetting:userSettingsObj.onComment // contains users on comment setting
              });
        }).catch((error:any)=>{
          console.log("There is an error in getting settings from storage: ",error);
        })
      }
    });
  }

  ratePost(rating){
    console.log(this.userService);
    let rate = {
    	post_id: this.post.post_id,
    	value: rating,
      user: {
        userid: this.userService.currentUserId,
        full_name : this.userService.me.full_name,
        profile_picture:this.userService.me.profile_picture
      }
    }
    this.myRating = rating; // assigning the value before-hand for UX
    this.api.post('addRatingsByPostId', rate).subscribe((res:any)=>{
      console.log('addRatingsByPostId', res);
      if(res.status==200){
        this.myRating = res.data.value?res.data.value:this.myRating; //  just in case if the rating was not successful
        // calling event rate-post
        this.util.getFromStorage('userSettings').then((userSettingsObj:any)=>{
          this.socketio.emit("rate-post",{
            room:this.post.userid,
            userid:this.post.userid,
            post_id: this.post.post_id,
            data:rate,
            event:"rate-post",
            userOnLikeSetting: userSettingsObj.onLike
          });
        });
      } else {
         console.log('Error while liking post: ', res);
       }
     });
  }

  incrementViewsByPostId(id){
    let viewData = {
      post_id: id,
    	userid: this.userService.currentUserId
    }
    this.api.post('incrementViewsByPostId',viewData).subscribe((res:any)=>{
    console.log("Increment views :: Start ",res);
    });
  }

  deletePost(post_id){
    console.log("posting: ",post_id);
    let buttons = [{
        text: 'Yes, delete it!',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          console.log('Remove clicked');
          this.util.presentLoading("Removing post...");
          this.api.delete('deletePostByPostId?post_id=', post_id).subscribe((res:any)=>{
            // this.api.post('updateStreaks', {}).subscribe((res:any)=>{
            //   console.log('Streaks Updated');
            // });
            console.log('deletePostByPostId::', res);
            if(res.status == 200){
              for (let i = 0; i < this.userService.me.posts.length; i++) {
                 if ( this.userService.me.posts[i].post_id === post_id) { this.userService.me.posts.splice(i, 1); i--; }
              }
              this.util.getFromStorage('category').then((localCat:any)=>{
                let localDelIndex = localCat[this.post.category].findIndex(o=>o.post_id===this.post.post_id);
                let dataDelIndex = this.dataService.posts.findIndex(o=>o.post_id===this.post.post_id);
                localCat[this.post.category].splice(localDelIndex, 1);
                this.dataService.posts.splice(dataDelIndex, 1);
                this.util.setToStorage('category', localCat);

              });
              this.util.dismissModal(this);
              this.util.dismissLoading();
              this.util.presentToast('Post Deleted!', '', 3000);
            }
          });
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }];

    this.util.presentActionSheet('Confirm Delete?', buttons);
  }

  dropDownOptions(comment_id,post_id,userid,ev?:any){
     console.log("inside the dropdownoptions function: ",comment_id,"//",post_id,"//",userid,"//",this.post);
     if(this.post.userid == this.userService.currentUserId){
     console.log("the userid's match, inside the if condition of dropdownoptions");
          let buttons = [
            {
              text: 'Cancel',
              role:'cancel',
              cssClass: 'secondary',
              handler: () => {
                 console.log('confirm cancel');
              }
            }, {
              text: 'Delete',
              role:'destroy',
              cssClass: 'danger',
              handler: () => {
                console.log('deleteFunction called');
                this.deleteCommentByPostId(comment_id,post_id);
              }
            }
          ]
          this.util.presentAlert("","What would you like to do ?",buttons," ")
        }
        else{
          console.log("the userid's do not match, inside the else condition");
          if(this.post.comment.find(o => o.userid === this.userService.currentUserId)){
            console.log("not user's post but it is user's comment, inside if",this.post.comment.find(o => o.userid === this.userService.currentUserId));
            let buttons = [
              {
                text: 'Cancel',
                role:'cancel',
                cssClass: 'secondary',
                handler: () => {
                  console.log('confirm cancel');
                }
              }, {
                text: 'Delete',
                role:'destroy',
                cssClass: 'danger',
                handler: () => {
                  console.log('deleteFunction called');
                  this.deleteCommentByPostId(comment_id,post_id);
                }
              }
            ]
            this.util.presentAlert("","What would you like to do ?",buttons," ")
          }
          else{
            console.log("not user's post or user's comment");
          }
        }
  }

  deleteCommentByPostId(comment_id,post_id){
    console.log("inside the delete comment function",comment_id,"//",post_id);
    console.log("post information: ",this.post);
    if(this.post.userid == this.userService.currentUserId){
       this.util.presentLoading("Deleting Comment");
       console.log("since this is user's post, inside if",this.post);
       this.api.delete("deleteCommentByCommentId?comment_id="+comment_id+"&id="+post_id+"&userid="+this.userService.currentUserId,"").subscribe((res:any)=>{
        this.util.dismissLoading();
        console.log("deletecommentbypostid response: ",res);
        if(res.status == 200){
          let commentIndex = this.post.comment.findIndex(o => o.comment_id === comment_id);
          console.log("commentIndex: ",commentIndex);
          this.post.comment.splice(commentIndex,1);
          let commentListIndex = this.commentList.findIndex(o => o.comment_id === comment_id);
          console.log("commentList index: ",commentListIndex);
          this.commentList.splice(commentListIndex,1);
          this.util.presentToast("Comment Deleted","Your comment was deleted successfully",2000);
        }
     })
    }
    else{
      console.log("not user's post but a comment in some other post, inside else");
      if(this.post.comment.find(o => o.userid === this.userService.currentUserId)){
        console.log("since this is user's comment but not user's post, inside if",this.post);
        this.api.delete("deleteCommentByCommentId?comment_id="+comment_id+"&id="+post_id,"").subscribe((res:any)=>{
          console.log("deletecommentbypostid response: ",res);
          if(res.status == 200){
            let commentIndex = this.post.comment.findIndex(o => o.comment_id === comment_id);
            console.log("commentIndex: ",commentIndex);
            this.post.comment.splice(commentIndex,1);
            let commentListIndex = this.commentList.findIndex(o => o.comment_id === comment_id);
            console.log("commentList index: ",commentListIndex);
            this.commentList.splice(commentListIndex,1);
          }
       })
      }
    }
  }

  dismiss() {
    this.util.dismissModal(this);
  }

  // openProfilePage(item){
  //   console.log("inside openProfilePage: ",item);
  //   this.util.presentModal(ProfileComponent,item,'ProfileComponent',false);
  // }



}
