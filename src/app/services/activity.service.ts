import { Injectable } from '@angular/core';

import { ApiService } from "./api.service";
import { DataService } from "./data.service";

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  public currentActivity:any = [];

  public activitiesList:any = [];

  public tempActivityList:any = [];

  public commentList:any = [];

  public isNewComment:any = false;

  public disableComment:boolean = false;

  public wasRecentComment:boolean = false;

  constructor(
    private api: ApiService,
    public data:DataService
    ) { }

  setCurrentActivity(activity){

    console.log('ActivityService : setCurrentActivity() : activity : ', activity);
    this.currentActivity = {};
    return new Promise((resolve, reject)=>{
      setTimeout(() => {
        this.currentActivity = {
            title: activity.title?activity.title:"",
            description: activity.description?activity.description:"",
            start_date_time: activity.start_date_time?activity.start_date_time:"",
            end_date_time: activity.end_date_time?activity.end_date_time:"",
            category: activity.category?activity.category:"",
            type: activity.type?activity.type:"",
            baseline: activity.baseline?activity.baseline:"Once upon a time...",
            credits: activity.credits?activity.credits:0,
            media: activity.media,
            tags: activity.tags?activity.tags:[],
            location: activity.location?activity.location:{},
            participants: activity.participants?activity.participants:[],
            rating: activity.rating?activity.rating:[],
            feedback: activity.feedback?activity.feedback:[],
            created_time: activity.created_time?activity.created_time:"",
            activity_id: activity.activity_id?activity.activity_id:"",
            comments: activity.comments?activity.comments:[]
        }
        resolve();
      }, 500);
    });
  }

  public timer:number = 0;

  runTimerFor(span){

    if(this.timer<=0){
      this.timer = span;
    } else {
      this.disableComment = true;
      return 0;
    }

    var runTime = setInterval(()=>{
      this.timer--;
    }, 1000);

    setTimeout(() => {
      clearInterval(runTime);
    }, span*1000);
  }

  // getAllActivities(){
  //   return new Promise((resolve, reject)=>{
  //     this.data.getAllActivities().then((activities:any)=>{
  //       console.log("Activities: ", activities);
  //       resolve(activities);
  //     });
  //   });
  // }

  getAllActivities(){
    return new Promise((resolve, error) => {
      this.api.get('getAllActivities').subscribe((activities)=>{
        this.data.checkForNewUpdates();
        this.activitiesList = activities;
        this.tempActivityList = activities;
        resolve();
      });
    });
  }

  getCurrentActivity(){
    return this.currentActivity;
  }
}
