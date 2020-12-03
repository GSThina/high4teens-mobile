import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  // public userSettingsList = [];

  constructor(
    private api:ApiService,
    private util:UtilService 
    ) { }

  getUserCurrentSettings(settingsArray){
    console.log("The current user settings are: ",settingsArray);
    this.api.post("createUserSettingsDetails",settingsArray).subscribe((data:any)=>{
      console.log("Settings page repsonse from server is:", data);
      if(data.status == 200){
        console.log("Users Settings are: ",data.userSettings);
        //code to set user settings in local storage.
        this.util.setToStorage('userSettings',data.userSettings);
      }else if(data.status == 201){
        console.log("Users settings object is now created....user settings need to be updated",settingsArray);
        let userSettingObject = {
          userid:settingsArray.userid,
          allNewPosts:true,
          followersNewPosts:true,
          onFollow:true,
          onLike:true,
          onComment:true,
          statsUpdate:true,
          newActivity:true
        }
        this.util.setToStorage('userSettings',userSettingObject);
      }else{
        console.log("Sorry...your settings could not be set. Please try again later.");
      }
    })
    // console.log("The current users settings list is: ",this.userSettingsList);
  }

  // updateUserSettings(updatedSettingsArray,self){
  //   console.log();
  //   this.api.post("updateUserSettingsDetails",updatedSettingsArray).subscribe((data:any)=>{
  //     console.log("Response of updateuser settings is: ",data);
  //     if(data.status == 200){
  //       this.util.setToStorage('userSettings',data.userSettings);
  //       console.log("Settings updated successfully");
  //     }else{
  //       console.log("Settings could not be updated");
  //     }
  //   })
  // }
}