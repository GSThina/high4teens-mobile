import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { UserService } from '../../services/user.service'
import { UtilService } from "../../services/util.service";
import { SettingsService } from "../../services/settings.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {

  constructor(
    private util: UtilService,
    private api: ApiService,
    private user: UserService,
    private settings: SettingsService
    ) { }

  public userCurrentSettings:any = [];

  public userPreviousSettings:any = [];

  public allNewPosts:any = true;
  public followersNewPosts:any = true;
  public onFollow:any = true;
  public onLike:any = true;
  public onComment:any = true;
  public statsUpdate:any = true;
  public newActivity:any = true;


  ngOnInit() {
      this.checkUserSettings();
  }

  checkUserSettings(){
    // perform a get from storage and store values here to manipulate frontend.
    this.util.getFromStorage('userSettings').then((arr:any)=>{
      arr = (arr!=null)?arr:{
          allNewPosts : true,
          followersNewPosts : true,
          onFollow : true,
          onLike : true,
          onComment : true,
          statsUpdate : true,
          newActivity : true
        };
      this.userCurrentSettings.push(arr);
      this.allNewPosts = arr.allNewPosts;
      this.followersNewPosts = arr.followersNewPosts;
      this.onFollow = arr.onFollow;
      this.onLike = arr.onLike;
      this.onComment = arr.onComment;
      this.statsUpdate = arr.statsUpdate;
      this.newActivity = arr.newActivity;
    }).catch(error=>{
      console.error("Error in getting settings",error);
    })
    console.log("Current User Settings are: ",this.userCurrentSettings);
  }

  saveSettingDetails(ev:any,code){
    console.log("Event is: ",ev,"//",ev.detail);
    console.log("Inside the saveStatus function of Settings Page",code);
    switch(code){
      case 10:
        this.allNewPosts = ev.detail.checked;
        this.userCurrentSettings[0].allNewPosts = this.allNewPosts;
        break;
      case 11:
        this.followersNewPosts = ev.detail.checked;
        this.userCurrentSettings[0].followersNewPosts = this.followersNewPosts;
        break;
      case 12:
        this.onFollow = ev.detail.checked;
        this.userCurrentSettings[0].onFollow = this.onFollow;
        break;
      case 13:
        this.onLike = ev.detail.checked;
        this.userCurrentSettings[0].onLike = this.onLike;
        break;
      case 14:
        this.onComment = ev.detail.checked;
        this.userCurrentSettings[0].onComment = this.onComment;
        break;
      case 15:
        this.statsUpdate = ev.detail.checked;
        this.userCurrentSettings[0].statsUpdate = this.statsUpdate;
        break;
      case 16:
        this.newActivity = ev.detail.checked;
        this.userCurrentSettings[0].newActivity = this.newActivity;
        break;
      default:
        console.log("Wrong code entered");
        break;
    }
  console.log("The updated users settings are: ",this.userCurrentSettings);
  console.log("userCurrentSettings is: ",this.userCurrentSettings);
  // this.settings.updateUserSettings(this.userCurrentSettings[0]);  //sending an object not an entire array.
}

  dismiss(ev?:any){
    let status = false;
    console.log("Inside the saveStatus function of Settings Page",status,"//",this.userCurrentSettings[0]);
      let buttons = [
        {
          text: 'Save',
          role:'save',
          cssClass: 'secondary',
          handler: () => {
             console.log('save clicked');
             this.api.post("updateUserSettingsDetails",this.userCurrentSettings[0]).subscribe((data:any)=>{
               if(data.status == 200){
                 status = true;
                 console.log("UpdateUserSettings Reponse is: ",data);
                 this.util.setToStorage('userSettings',this.userCurrentSettings[0]);
                 this.util.dismissModal(this);
               }else{
                 console.log("An error occured while updating your settings page, please try again later");
               }
             })
          }
        }, {
          text: 'Cancel',
          role:'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('cancel clicked');
          }
        }
      ]
      this.util.presentAlert("Are you sure ?","",buttons,"")
      if(status){
        this.util.dismissModal(this);
      }else{
        console.log("Could not update settings.");
      }
  }

}
