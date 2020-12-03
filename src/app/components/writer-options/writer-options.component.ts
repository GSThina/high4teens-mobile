import { Component, OnInit, Input } from '@angular/core';
import { NavParams } from '@ionic/angular';

import { DataService } from "../../services/data.service";
import { EditorService } from "../../services/editor.service";
import { UtilService } from "../../services/util.service";
import { PushService } from "../../services/push.service";
import { ImagesService } from "../../services/images.service";
import { UserService } from "../../services/user.service";
import { ApiService } from "../../services/api.service";
import { Camera } from '@ionic-native/camera/ngx';
import { ActionSheetController } from '@ionic/angular';

// import { PostDetailComponent } from '../post-detail/post-detail.component';
// import { ProfileComponent } from '../profile/profile.component'
import { SettingsComponent } from '../settings/settings.component';


@Component({
  selector: 'app-writer-options',
  templateUrl: './writer-options.component.html',
  styleUrls: ['./writer-options.component.scss'],
})
export class WriterOptionsComponent implements OnInit {

  public options:any = this.nav.get('data');

  public categoryList:any = [];

  public isPublishEnabled:any = [];

  constructor(
    public util: UtilService,
    public api: ApiService,
    private nav: NavParams,
    public dataService:DataService,
    public editorService:EditorService,
    public imagesService: ImagesService,
    public userService: UserService,
    private pushService: PushService,
    private camera: Camera,
    private actionSheetController: ActionSheetController
  ) {

  }

  public customActionSheetOptions: any = {
    header: 'Category',
    subHeader: 'Choose multiple categories'
  };

  ngOnInit() {
  	console.log((this.options==undefined)?"'No Options passed' + this.options":this.options);
    for (let i = 0; i < this.dataService.stages.length; i++) {
      let category = this.dataService.stages[i];
      // category.isSelected = "category-not-selected";
      // category.isSelected = (this.editorService.selectedCategory!="")?"category-selected":"category-not-selected";
      this.categoryList.push(category);
    }

  }

  switchSelect(cat){
    if(!this.editorService.editor.me){
      // this.categoryList[cat.stage].isSelected = (this.categoryList[cat.stage].isSelected=='category-selected')?"category-not-selected":"category-selected";
      for (let i = 0; i < this.categoryList.length; i++) {
        this.categoryList[i].isSelected = (i==cat.stage)?'category-selected':'category-not-selected';
      }
      this.editorService.selectedCategory = this.categoryList[cat.stage].name;
      // console.log(this.categoryList[cat.stage],this.categoryList[cat.stage].isSelected);
    }
  }

  confirmPublish(){
    // console.log("Publish Post: ", this.editorService.editor);
    if(this.editorService.editor.media.thumbnail.url==""){
      console.log(this.imagesService);
      this.util.presentLoading('Picking an apt image for you...');
      this.imagesService.getImage(this.editorService.editor.title).then((image:any)=>{
        this.editorService.editor.media.thumbnail.url = image.urls.thumb;
        this.editorService.editor.media.standard_resolution.url = image.urls.regular;
        this.editorService.editor.media.low_resolution.url = image.urls.small;
        this.editorService.editor.color = image.color;

        this.doPublish();

        this.util.dismissLoading();

      }, (error:any)=>{

        console.log("No images found");

        let bg = this.editorService.editor.color?this.editorService.editor.color.substring(1, 7):'000';
        let text = (this.editorService.editor.title.length<10)?this.editorService.editor.title:this.editorService.editor.title.substring(0, 9);
        this.editorService.editor.media.thumbnail.url = "https://dummyimage.com/" + this.editorService.editor.media.thumbnail.width + "/" + bg + "/fff&text=" + text;
        this.editorService.editor.media.standard_resolution.url = "https://dummyimage.com/" + this.editorService.editor.media.standard_resolution.width + "/" + bg + "/fff&text=" + text;
        this.editorService.editor.media.low_resolution.url = "https://dummyimage.com/" + this.editorService.editor.media.low_resolution.width + "/" + bg + "/fff&text=" + text;

        this.doPublish();

        this.util.dismissLoading();

      });
    } else {
      this.doPublish();
    }
  }

  doPublish(){
    this.editorService.editor.userid = this.editorService.editor.user.userid;
    if(!this.editorService.editor.isDraft&&!this.editorService.editor.new){
      this.editorService.editor.status = 'Edited';
      this.util.presentLoading('Publishing changes...', 30000);
      this.util.dismissModal(this);
      //this.util.dismissLoading();
      this.editorService.editor.isDraft = false;
      this.dataService.updatePost(this.editorService.editor).then((res:any)=>{
        this.util.removeEditorFromLocal(this.editorService.editor);
        this.util.dismissModal(this);
        this.util.dismissLoading();
        // this.api.post('updateStreaks', {}).subscribe((res:any)=>{
        //   console.log('Streaks Updated');
        // });

        //show message
        // this.editorService.resetEditor();
        this.editorService.editor.me = true;
        this.editorService.selectedCategory = "";
        this.editorService.dirty = false;
        this.editorService.status = 'close';
        //this.util.dismissModal(this, 'WriteComponentComponent');
        this.util.presentToast(res.text, '', 3000);
        console.log("Response: ", res);
      });
    } else {
      this.editorService.editor.category = (this.editorService.selectedCategory!="")?this.editorService.selectedCategory:((this.editorService.editor.category!="")?this.editorService.editor.category:'general');
      this.editorService.editor.comment = [];
      this.editorService.editor.status = 'Published';
      // console.log("this.util.croppedImagepath: ", this.util.croppedImagepath);
          if(this.util.croppedImagepath!=""){
            this.util.presentLoading('Uploading image...', 30000);
            this.util.dismissModal(this);
            // this.util.startUpload(this.editorService.editor.media.profile).then((res:any)=>{
            //   console.log("URL data: ", res);
            //   this.editorService.editor.media.thumbnail.url = res.secureURL;
            //   this.editorService.editor.media.standard_resolution.url = res.secureURL;
            //   this.editorService.editor.media.low_resolution.url = res.secureURL;
            this.editorService.editor.isDraft = false;
            this.editorService.editor.new = false;
              this.dataService.publishPost(this.editorService.editor).then((res:any)=>{
                if(res.status == 200){
                  this.util.removeEditorFromLocal(this.editorService.editor);
                  this.util.dismissModal(this);
                  this.util.dismissLoading();
                // this.api.post('updateStreaks', {}).subscribe((res:any)=>{
                //   console.log('Streaks Updated');
                // });

                //show message
                // this.editorService.resetEditor();
                this.editorService.editor.me = true;
                this.editorService.selectedCategory = "";
                this.editorService.dirty = false;
                this.editorService.status = 'close';
                //this.util.dismissModal(this, 'WriteComponentComponent');
                this.util.presentToast(res.text, '', 3000);
                console.log("Response: ", res);
                // this.pushService.send('new-post', this.editorService.editor);
                }else{
                  this.util.dismissLoading();
                  this.util.presentToast(res.text, '', 3000);
                  console.log("Response: ", res);
                }

              // });

            });
          } else {
            this.util.presentLoading('Publishing...', 30000);
            this.util.dismissModal(this);
            this.editorService.editor.isDraft = false;
            this.dataService.publishPost(this.editorService.editor).then((res:any)=>{
              if(res.status == 200){
                this.util.removeEditorFromLocal(this.editorService.editor);
                this.util.dismissLoading();
                this.util.dismissModal(this);
              // this.api.post('updateStreaks', {}).subscribe((res:any)=>{
              //   console.log('Streaks Updated');
              // });

              //show message
              // this.editorService.resetEditor();
              this.editorService.editor.me = true;
              this.editorService.selectedCategory = "";
              this.editorService.dirty = false;
              this.editorService.status = 'close';
              //this.util.dismissModal(this, 'WriteComponentComponent');
              this.util.presentToast(res.text, '', 3000);
              console.log("Response: ", res);
              // this.pushService.send('new-post', this.editorService.editor);
              }else{
                this.util.dismissLoading();
                this.util.presentToast(res.text, '', 3000);
                console.log("Response: ", res);
              }

            });
      }
    }
  }

  editUserProfile(){
    console.log("Edit User Profile");
    this.util.dismissPopover();
  }

  async uploadProfileImage(){
    this.util.presentLoading('Uploading Image...');
    this.api.put('editUserDetailsByUserId',this.util.croppedImagepath).subscribe((response:any) => {
      this.util.dismissLoading();
      if(response.status == 200){  
        this.userService.me.profile_picture = response.profile_picture;
      }else{
        this.util.presentAlert("Sorry","The image could not be uploaded");
      }
    })
  }

  async changeUserProfilePic(){
    console.log("Change User Profile Pic");
    this.util.dismissPopover();
    const actionSheet = await this.actionSheetController.create({
      header: "Select Image source",
      buttons: [{
        text: 'From Phone',
        handler: () => {
          this.util.presentLoading('Loading Image...');
          this.util.pickImage(this.camera.PictureSourceType.PHOTOLIBRARY).then((image:any)=>{
            // this.userService.me.profile_picture = this.util.croppedImagepath;
            this.uploadProfileImage();
            this.util.dismissLoading();
          });
        }
      },
      {
        text: 'Use Camera',
        handler: () => {
          this.util.presentLoading('Loading Image...');
          this.util.pickImage(this.camera.PictureSourceType.CAMERA).then((image:any)=>{
            // this.userService.me.profile_picture = this.util.croppedImagepath;
            this.uploadProfileImage();
            this.util.dismissLoading();
          });
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }]
    });
    await actionSheet.present();

  }

  removeUserProfilePic(){
    console.log("Remove User Profile Pic");
    
    this.util.dismissPopover();
  }

  openSettingsPage(){
    console.log("Open Settings Page");
    this.util.dismissPopover();
    this.util.presentModal(SettingsComponent,null,'SettingsComponent',false);
  }

  confirmLogout(){
    let buttons = [{
        text: 'Sure',
        handler: () => {
          this.userService.invalidateToken();
          this.util.dismissPopover();
        }
      }, {
        text: 'Cancel',
        handler: () => {
          console.log('Cancel clicked');
          this.util.dismissPopover();
        }
      }];
    this.util.presentAlert('Are you sure?', 'All your unsaved informations would be cleared!', buttons);
  }

  logout(isForceClose?:any) {
    if(isForceClose.type=="click"){
      this.confirmLogout();
    } else {
      this.userService.invalidateToken();
      this.util.dismissPopover();
    }
  }

//   searchAuthor(ev?:any){
//     //console.log("inside the searchAuthor function: ",ev.target.value);
//     let searchData = { full_name:ev };
//     console.log("searchdata: ",searchData);
//     this.dataService.getUserDetailsByName(searchData).then((value:any)=>{
//       this.options.listItems = (value.status!=400)?value:[];
//       console.log("Here are the list authors: ",value);
//     })
//   }

//   searchPosts(ev?:any){
//     console.log("inside the searchpost function: ",ev);
//     let searchData = {title:ev};
//     this.dataService.getPostsByTitle(searchData).then((value:any)=>{
//       this.options.listItems = (value.status!=400)?value:[];
//       console.log("Here are the posts you asked for: ",value);
//     })
//   }

//   public searchType:string="all";
//   setSearchType(ev?:any){
//    console.log("inside setSearchType function: ",ev);

//    this.options.listItems = [];
//    this.searchQuery = "";

//    this.searchType = ev.target.value.toString();
//   }

//   public searchQuery:string="";
//   setSearchQuery(ev?:any){
//    console.log("inside the searchQuery function: ",ev);
//    this.searchQuery = ev.target.value.toString();
//    this.searchFunction(this.searchQuery);
//   }

//   searchFunction(query){
//     if(this.searchType.localeCompare('author')==0) {
//       this.searchAuthor(query);
//     }
//     else if(this.searchType.localeCompare('posts')==0){
//       this.searchPosts(query);
//     }
//     else{
//       console.log("Search all is not implemented currently");
//     }
//   }

//   openProfilePage(item){
//     console.log("inside openProfilePage: ",item);
//     this.util.presentModal(ProfileComponent,item,'ProfileComponent',false);
//   }


//   openPostDetail(item){
//     console.log("inside openPostDetials: ",item);
//     this.util.presentModal(PostDetailComponent,item,'PostDetailComponent',false);
//   }

//   dropDownOptions(ev: any){
//     let payload = {
//       isList:true,
//       listItems:[
//       //isSearch:true,
//       {
//         text:"Authors",
//         handler:"searchAuthor"
//       },
//       {
//         text:"Posts",
//         handler:"searchPosts"
//       }
//      ]
//     }
//     this.util.presentPopover(ev,WriterOptionsComponent,payload)
//   }

}
