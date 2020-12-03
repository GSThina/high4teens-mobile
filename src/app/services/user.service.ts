import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { DataService	} from './data.service';
import { UtilService	} from './util.service';
import { ApiService	} from './api.service';
import { SocketioService } from './socketio.service';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public defaultCategory:string = 'Kids';

  public onlineUsers:any = [];

  public me:any = {
    userid: '',
    posts : [],
    stats : []
  };

  public otherUser:any = {
    userid: '',
    posts:[],
    stats:[]
  }

  public currentUserId:string = "";

  public dummyimage:string = "../../assets/img/logo-icon.png";

  public isLoaded = false;

  public isLoggedIn = false;

  public isUserFollowing = false;

  public userNotificationList = [];

  public userSettings:any = [];

  constructor(
    private data: DataService,
    private util: UtilService,
    private api: ApiService,
    private router: Router,
    private socketio: SocketioService,
    private settings: SettingsService
  ) {

    // if(this.isLoggedIn){
    //   this.util.presentLoading('Loading your stats...');
    //   this.getCurrentUserDetails().then(data=>{
    //     this.getCurrentUserPosts();
    //     this.getCurrentUserStats();
    //     this.util.dismissLoading();
    //   });
    // } else {
    //
    // }

  }

  initializeUser(){
    if(this.isLoggedIn){
      this.getCurrentUserDetails().then((data:any)=>{
        this.settings.getUserCurrentSettings({userid:this.currentUserId});
        this.socketio.initialize();
        this.socketio.subscribeToRoom(this.currentUserId,this.currentUserId);
        this.socketio.subscribeToRoom("AppUpdate",this.currentUserId);
        //write if condition for settings page all post option
        // if(this.userSettings[0].allNewPosts){
          // this.socketio.subscribeToRoom("AllPosts",this.currentUserId);
        // }
        this.checkUserNotification(this.currentUserId);
        // this.getCurrentUserPosts();
        // this.getCurrentUserBadges();
      });
      return true;
    } else {
      return false;
    }
  }

  checkAuthStateToLogin(path:any){
    console.log("path.split('?')[0]:"+ path.split('?')[0], path.split('?')[0]!="password");
    if(path!='login'&&path.split('?')[0]!="password"){
      this.util.getFromStorage('token').then((token)=>{
        if(token){
          this.api.token = token;//this.util.getFromStorage('token');
          this.isLoggedIn = true;
          this.initializeUser();
          this.router.navigateByUrl('/'+path);
        } else {
          this.router.navigateByUrl('/login');
        }
      });
    } else {
      this.router.navigateByUrl('/'+path);
    }
  }

  setAuthState(state, token){
    if(state){
      this.util.setToStorage('token', token);
      this.isLoggedIn = true;
      this.checkAuthStateToLogin('');
    } else {
      this.util.getAllKeysOfStorage().then((keys:any)=>{
        console.log(keys);
        for (let i = 0; i < keys.length; i++) {
          this.util.setToStorage(keys[i], null);
        }
        this.isLoggedIn = false;
        this.checkAuthStateToLogin('login');
      })
    }
  }

  login(loginDetails){
    console.log(loginDetails);
    //loginDetails.type = 'username';
    const emailRegex = /\S+@\S+\.\S+/;
    const phoneRegex = /^\d+$/;
    console.log(typeof loginDetails.identity)
    loginDetails.type = (phoneRegex.test(loginDetails.identity) && loginDetails.identity.length == 10)?"phone":(emailRegex.test(loginDetails.identity)?"email":"username");
    console.log("loginType: ",loginDetails.type);
    this.util.presentLoading('Logging in with ' + loginDetails.type + '...');
      this.api.post('loginUser', loginDetails).subscribe((data:any) => {
          this.util.dismissLoading();
          console.log('HTTP response', data)
          console.log(data);
          let token = (data.token)?data.token:null;
          data = (data.status)?data:data.message;
          if(data.status==200){
            this.util.presentToast('Welcome!', 'Logged in as ' + loginDetails.identity, null);
            this.isLoggedIn = true;
            this.currentUserId = data.userid;
            this.util.setToStorage('currentUserId', data.userid).then(()=>{
            this.util.setToStorage('token', token).then(()=>{
              this.setAuthState(true, token);
            });
            // this.setAuthState(true, token);
            });
          }else{
            this.util.presentToastWithOptions('Hold on!', loginDetails.identity + ": " + data.text, null);
          }
        },
        error => {
          console.log('HTTP Error', error);
          this.util.presentToastWithOptions("Could not reach our servers", error.statusText, null);
        },
        () => console.log('HTTP request completed with no response')
      );
  }

  getCurrentUserPosts(){

    // this.util.presentLoading('Loading your collections...');
    this.util.getFromStorage('currentUserId').then((id:any)=>{
      let payload:any = {
        userid: id
      }
      this.api.post('getPostByUserId', payload).subscribe((res:any)=>{
        this.me.posts = res.text?null:res;
        this.pushDraftsToPost();
        console.log(this.me.posts);
      });
      // this.data.getCurrentUserPosts(payload).then((res:any)=>{
      //   console.log("DataService : getCurrentUserPosts() : ", res);
      //   this.me.posts = res;
      //   // this.util.dismissLoading();
      // });
    });
  }

  pushDraftsToPost(){
    this.util.getFromStorage('drafts').then((drafts:any)=>{
      // console.log("Checking drafts: ", drafts);
      let a = JSON.parse(drafts) || [];
      a.forEach(element => {
        // let index:any = Object.keys(element);
        console.log("Added to Draft", element);// element[Object.keys(drafts)[0]]);
        this.me.posts.push(element);
      });
    })
  }

  getCurrentUserDetails(){

    return new Promise((resolve, reject)=>{
      this.util.getFromStorage('currentUserId').then((id:any)=>{
        this.currentUserId = id;
        console.log("currentUserId: ", id);
        this.data.getCurrentUser({userid: id}).then((res:any)=>{
          this.isLoaded = true;
          console.log("getCurrentUserDetails(): ", res);
          this.me = res;
          this.me.profile_picture = res.profile_picture?res.profile_picture:this.dummyimage;
          this.me.posts = null;
          if(res!=null){
            this.getCurrentUserStats();
            this.getCurrentUserPosts();
            this.getCurrentUserBadges();
            resolve(true);
          } else {
            this.setAuthState(false, null);
            resolve(false);
          }
        });
      }, (error:any)=>{
        console.log("Error: ", error);
      });
    });
  }

  getCurrentUserStats(){
      this.util.getFromStorage('currentUserId').then((id:any)=>{
        this.api.post('getAllStatsByUserId', {userid:id}).subscribe((res:any)=>{
        // this.api.post('getAllStatsByUserId').subscribe((res:any)=>{
        console.log(res);

          this.me.stats = res[0];
          // this.me.stats.badges = this.me.badges;
          // this.me.stats.streaks = 41;
          // this.me.stats.earnedPoints = this.me.stats.badges.length * 5;
          // this.me.stats.totalPoints = this.me.stats.posts + (this.me.stats.themedPost * 2) + (this.me.stats.translations * 5) + (this.me.stats.discussions * 2);
          console.log("Stats: ", this.me.stats);
      });
    });
  }
  getCurrentUserBadges(){
    let self = this;
    this.util.getFromStorage('currentUserId').then((id:any)=>{
      this.api.post('getAllBadgesByUserId', {userid:id}).subscribe((res:any)=>{
        // this.api.post('getAllStatsByUserId').subscribe((res:any)=>{
        console.log(res);
        console.log("Data Badges: ", this.data.badges);
        this.me.badges = this.data.badges;//res[0];
        console.log("Badges: ", this.me.badges);
      });
    });
  }

  getAllPostsByUserid(userid){
    let payload:any = {
      userid: userid
    }
    this.api.post('getPostByUserId', payload).subscribe((res:any)=>{
     this.otherUser.posts = res.text?null:res;
     console.log(this.otherUser.posts);
    });
  }

  getUserDetailsByUSerid(userid){
    return new Promise((resolve, reject)=>{
        this.data.getCurrentUser({userid: userid}).then((res:any)=>{
          this.isLoaded = true;
          console.log("getUserDetailsByUserid(): ", res);
          this.otherUser = res;
          this.otherUser.profile_picture = res.profile_picture?res.profile_picture:this.dummyimage;
          this.otherUser.posts = null;
          if(res!=null){
            this.getAllPostsByUserid(userid);
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
  }

  getStatsByUserid(userid){
    this.api.post('getAllStatsByUserId', {userid:userid}).subscribe((res:any)=>{
      console.log(res);
        this.otherUser.stats = res[0];
        console.log("getAllStatsByUserid: ", this.otherUser.stats);
    });
  }

  followUser(myUserid,otherUserid){
    this.api.post("followUser",{me:myUserid,userid:otherUserid}).subscribe((res:any)=>{
      console.log("Inside the followUser function: ",res);
      if(res.status == 200 || res.status == 201){
        console.log(res.text);
        this.isUserFollowing = true;
        // this.util.getFromStorage("userSettings").then((userSettingsObj:any)=>{
          this.socketio.subscribeToRoom(myUserid,otherUserid);
            this.socketio.emit("on-follow",{
              userid:otherUserid,
              otherUserid:myUserid,
              room:myUserid,
              data:{
                user: {
                  profile_picture:this.me.profile_picture,
                  full_name:this.me.full_name,
                  userid:myUserid
                }
              },
              event:"on-follow"
            })
        // }).catch((error:any)=>{
        //   console.error("There is an error while getting user settings from storage <user.service> line 292: ",error)
        // })
      }else{
        console.log("There seems to be an issue: ",res.text);
      }
    })
  }

  unfollowUser(myUserid,otherUserid){
    this.api.post("unfollowUser",{me:myUserid,userid:otherUserid}).subscribe((res:any)=>{
      console.log("Inside the unfollowUser function: ",res);
      if(res.status == 200 || res.status == 201){
        console.log(res.text);
        this.isUserFollowing = false;
        this.socketio.unSubscribeFromRoom(otherUserid, myUserid);
        this.socketio.emit("on-unfollow",{
          userid:otherUserid,
          otherUserid:myUserid,
          room:myUserid,
          data:{
            user: {
              profile_picture:this.me.profile_picture,
              full_name:this.me.full_name,
              userid:myUserid
            }
          },
          event:"on-unfollow"
        })
      }else{
        console.log("There seems to be an issue: ",res.text);
      }
    })
  }

  checkFollowingStatus(myUserid,otherUserid){
    this.api.post("checkUserFollowStatus",{me:myUserid,userid:otherUserid}).subscribe((res:any)=>{
      console.log("Inside the checkFollowingStatus function: ",res);
      if(res.status == 200){
        this.isUserFollowing = true;
        console.log("You are already following this user");
      }else{
        this.isUserFollowing = false;
        console.log("You are not yet following this user");
      }
    })
  }

  // adhocCheckFollowingStatus(myUserid,otherUserid){
  //   this.api.post("checkUserFollowStatus",{me:myUserid,userid:otherUserid}).subscribe((res:any)=>{
  //     console.log("Inside the checkFollowingStatus function: ",res);
  //     if(res.status == 200){
  //       return true;
  //     }else{
  //       return false;
  //     }
  //   })
  // }

  checkUserNotification(myUserid){
    this.api.post("createNotificationList",{userid:myUserid}).subscribe((res:any)=>{
      console.log("Inside the checkUserNotification Function",res);
      if(res.status == 201){
        console.log("User already has a notification list");
        this.userNotificationList.length=0;
        this.userNotificationList = res.notificationList[0].notification;
      }else if(res.status == 200){
        console.log("Notification List created succesfully");
      }else{
        console.log("Notification List cannot be created for user.");
      }
    });
  }

  invalidateToken(){
    this.setAuthState(false, null);
  }

}
