import { Injectable } from '@angular/core';

import { UserService } from "./user.service";
import { UtilService } from "./util.service";

@Injectable({
  providedIn: 'root'
})
export class EditorService {

	public editor:any = {};

  public status:any = 'open';

  public colorPaletteShow:boolean = false;

  public selectedCategory:any = "";

  public dirty:boolean = false;

  public grammarCorrections:any = [];

  constructor(private userService: UserService, private util: UtilService) {
    this.initializeEditor();
  }

  initializeEditor(){
    console.log("EditorService : initializeEditor() : START");

    this.status = 'open';

    this.editor = {
      status: "New",
      color: "",
      user: {
        full_name: this.userService.me.full_name,
        profile_picture: this.userService.me.profile_picture,
        userid: this.userService.me.userid
      },
      media: {
          low_resolution: {
              url: "",
              width: 512,
              height: 512
          },
          thumbnail: {
              url: "",
              width: 256,
              height: 256
          },
          standard_resolution: {
              url: "",
              width: 1024,
              height: 1024
          }
      },
      type: "long",
      tags: [],
      category: "",
      title: "",
      subtitle: "",
      description: {
          content: null
      },
      isDraft: true,
      new: true,
      isQuill: true
    }

    this.selectedCategory = "";

    console.log("EditorService : initializeEditor() : editor : ", this.editor);

    console.log("EditorService : initializeEditor() : END");

  }

  validateEditor(){
    return new Promise((resolve, reject)=>{
      let warn = {
        header: 'Hold On',
        message: 'Something seems not correct'
      }
      // if(this.editor.description.content.trim()==""){
      //   warn.header = 'Looks like an empty editor';
      //   warn.message = 'Content should be at least 45 characters long!';
      //   resolve(warn);
      // } else if (this.editor.description.content.trim().length<45) {
      //   warn.header = 'Length is very short';
      //   warn.message = 'Content should be at least 45 characters long!';
      //   resolve(warn);
      // } else
      if(this.editor.title.trim()==""){
        warn.header = 'Did you miss the Title?';
        warn.message = 'A Title for your content would be amazing!';
        resolve(warn);
      } else if (this.editor.title.length>45){
        warn.header = 'The Title seems to be quite longer';
        warn.message = 'May be you can add and Format it in the editor';
        resolve(warn);
      } else if(this.editor.subtitle.trim()==""){
        warn.header = 'Could you provide a Subtitle too?';
        warn.message = 'Using subtitle, you are going to build a context for your content!';
        resolve(warn);
      } else if(this.editor.description.content.getText().length<45){
        warn.header = 'The content seems to be very little';
        warn.message = 'Could you please type in more content to impact the world?';
        resolve(warn);
      } else if (this.editor.category.length<1){
        warn.header = 'Please choose Category';
        warn.message = 'We believe, you are the right person to choose the category for your content';
        resolve(warn);
      } else {
        resolve(null);//this.util.presentAlert(warn.header, warn.message);
      }
    });
  }

  getEditorConfig(){
    return {
        "user": {
            "full_name": "G Surendar Thina",
            "profile_picture": "data:image/jpeg;base64,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",
            "userid": "wdjlCgEI7"
        },
        "media": {
            "low_resolution": {
                "url": "http://dummyimage.com/512x512.jpg/5fa2dd/ffffff",
                "width": 512,
                "height": 512
            },
            "thumbnail": {
                "url": "http://dummyimage.com/256x256.jpg/5fa2dd/ffffff",
                "width": 256,
                "height": 256
            },
            "standard_resolution": {
                "url": "http://dummyimage.com/1024x1024.jpg/5fa2dd/ffffff",
                "width": 1024,
                "height": 1024
            }
        },
        "type": "image/png",
        "tags": [
            "teenage",
            "media",
            "education"
        ],
        "location": {
            "latitude": "",
            "longitude": "",
            "country": "",
            "street_address": "",
            "name": ""
        },
        "category": "kids",
        "title": "Character",
        "description": {
            "content": "This character description generator will generate a fairly random description of a belonging to a random race. However, some aspects of the descriptions will remain the same, this is done to keep the general structure the same, while still randomizing the important details.."
        },
        "post_id": "px8tMBXxs",
        "created_datetime": "Sat Apr 18 2020 08:57:48 GMT+0530 (India Standard Time)"
    }
  }

  resetEditor(){
    console.log("EditorService :: resetEditor() :: START");
  	this.initializeEditor();
		console.log("EditorService :: resetEditor() :: END");
  }
}
