import { Injectable } from '@angular/core';

import { SERVER_URL } from '../../environments/environment';
// import { SettingsService } from './settings.service'

import { UtilService } from "./util.service";
// import { ActivityService } from "./activity.service";

import io from 'socket.io-client';

const socket = io(SERVER_URL);

// const server = require('http').createServer();
// const io = require('socket.io');

@Injectable({
  providedIn: 'root'
})
export class SocketioService {

  public subscriptions:any = [];

  public socketConnection:any;

  constructor(
    private util: UtilService,
    // private settings: SettingsService
  //  public activityService: ActivityService
  ) { }

  async initialize(){

    let self = this;
    this.getUserSettings();

    console.log("Users preffered subscriptions are: ",this.subscriptions);

    //this.subscriptions = ['alerts', 'join-activity', 'leave-activity', 'new-comment', "rate-post", "all-posts", "new-post", "post-by-following", "app-update","stats-update","on-follow"]; // need to fetch from server


    for (let index = 0; index < this.subscriptions.length; index++) {
      await this.subscribeToEvent(this.subscriptions[index]);   // change to single-events instead of entire subscriptions array.
    }


    socket.on('connect', function(){
      self.setSocketConnection(true);
      if(socket.connected){
        console.log("Socket connected");
      } else {
        console.log("Socket not connected");
      }
    });

    socket.on('disconnect', function(){
      self.setSocketConnection(false);
      console.log("Socket server disconnected");
    });

    socket.on('connect_failed', function(){
      self.setSocketConnection(false);
      console.log("Failed connecting to server");
    });

  }

  getUserSettings(){
      let arr = [];
      this.util.getFromStorage('userSettings').then((userSettingsArr:any)=>{
        // converts userSettingsArr object into an array and returns all objects that are true based on users settings.
        Object.entries(userSettingsArr).filter(function([keys,values]){
          if(keys!="userid")  // returns only the keys that have boolean values and not the userid.
            return values;
        }).forEach(function([keys,values]){  // gets only keys from list.
          // switch statement to map the keys to right events
          switch(keys){
            case 'allNewPosts': arr.push('all-posts');
              break;
            case 'followersNewPosts': arr.push('new-post');
              break;
            case 'onFollow': arr.push('on-follow');
              break;
            case 'onLike': arr.push('rate-post');
              break;
            case 'new-comment': arr.push('new-comment');
              break;
            case 'statsUpdate': arr.push('stats-update');
              break;
            case 'newActivity': arr.push('join-activity');
              break;
            default: console.log("Wrong keyname entered");
              break;
          }
        });
        console.log("Array in socket service is: ",arr);
        // gets only required keys from the userSettingsArray
        //-------------NOTE: Object.fromEntries does not work in TS by default, additional parmas added in ts.config line 21 and es2019 must be added to make it work--------------
        // this.subscriptions = Object.keys(Object.fromEntries(userSettingsArr));
      }).catch((error:any)=>{
        console.log("There is an error in socket.service line 92: ",error);
      })
      // This line has to be written outside of the getFromStorage.then because of the scope of the this variable was only limited to the .then and not the function
      this.subscriptions = arr;
  }

  setSocketConnection(status){
    console.log("Network: ", status);

    this.socketConnection = status;
  }

  async subscribeToEvent(event){
    console.log('Subscribed to ', event);
    let self = this;
    socket.on(event, function(resPayload){
      console.log(event, ": ", resPayload);
      if(event=='new-comment'){
        // console.log(self.activityService.commentList.length);
        // self.activityService.wasRecentComment = false;
        // self.activityService.commentList.push(resPayload.data);
        // self.activityService.isNewComment = true;
        // console.log(self.activityService.commentList.length);
      }
      self.util.presentToast(resPayload.display, resPayload.message, 2000);
    });
  }

  async unSubscribeFromEvent(event){
    console.log('Subscribed to ', event);
    let self = this;
    socket.on(event, function(resPayload){
      console.log(event, ": ", resPayload);
      if(event=='new-comment'){
        // console.log(self.activityService.commentList.length);
        // self.activityService.wasRecentComment = false;
        // self.activityService.commentList.push(resPayload.data);
        // self.activityService.isNewComment = true;
        // console.log(self.activityService.commentList.length);
      }
      self.util.presentToast(resPayload.display, resPayload.message, 2000);
    });
  }

  async subscribeToRoom(room, userid){
    socket.emit("subscribe", { room: room, userid: userid });
    console.log("Subscribed to room: ", room);

  }

  async unSubscribeFromRoom(room, userid){
    socket.emit("unsubscribe", { room: room, userid: userid });
    console.log("Unsubscribed from room: ", room);
  }

  emit(event, payload){
    socket.emit(event, payload);
    console.log("Emiting event: ", event, payload);
  }

}
