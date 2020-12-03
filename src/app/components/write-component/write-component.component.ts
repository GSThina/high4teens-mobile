import { Component, OnInit, Input, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NavParams } from '@ionic/angular';

import { ActionSheetController } from '@ionic/angular';

// import { ImagePicker } from '@ionic-native/image-picker/ngx';

import { WriterOptionsComponent } from '../writer-options/writer-options.component';
import { ColorPaletteComponent } from '../color-palette/color-palette.component';
import { ImageSearchComponent } from '../image-search/image-search.component';
import { GrammarComponent } from '../grammar/grammar.component';

import { UtilService } from '../../services/util.service';
import { DataService } from '../../services/data.service';
import { EditorService } from '../../services/editor.service';
import { ImagesService } from '../../services/images.service';
import { UserService } from '../../services/user.service';
import { ApiService } from '../../services/api.service';

import { Crop } from '@ionic-native/crop/ngx';
import { File } from '@ionic-native/file/ngx';
import { Camera } from '@ionic-native/camera/ngx';

import {EditorModule} from 'primeng/editor';
import {CalendarModule} from 'primeng/calendar';



// import { Quill } from 'quill';

// import { Quill } from '../../../../node_modules/quill/core/quill';
// import * as Quill from '../../../../node_modules/quill/core/quill';

import * as Quill from 'quill';

@Component({
  selector: 'app-write-component',
  templateUrl: './write-component.component.html',
  styleUrls: ['./write-component.component.scss'],
})

export class WriteComponentComponent implements OnInit {

  // @ViewChild(WriteComponentComponent) scrollComponent: WriteComponentComponent;

	// public options: any = {};
	public toolbarOptions:any = [];

  public categoryList:any = [];

	public options:any = this.nav.get('data');

  public text:string = "Editor is here";

	// public editorService.editor:any;

  constructor(
    private camera: Camera,
    private actionSheetController: ActionSheetController,
    // private crop: Crop,
    // private file: File,
  	private util: UtilService,
  	private nav: NavParams,
  	// private imagePicker: ImagePicker,
  	public editorService: EditorService,
    private imagesService: ImagesService,
    private dataService: DataService,
    private userService: UserService,
  	private api: ApiService
    ) {

  	// this.editorService.editor = this.edit.config;
    console.log("WriteComponentComponent :: constructor() :: options :: ", this.options);
  }

  ionViewWillEnter(){
    console.log("Editor Status? ", this.editorService.status);

    if(this.options.isQuill){
      this.initializeQuillEditor();
    } else {
      this.editorService.initializeEditor();
    }

    (this.editorService.status.toLowerCase()=='close')?this.dismiss():null;
  }

  ngOnInit() {

    console.log("WriteComponentComponent :: ngOnInit() :: getQuill :: ");

    for (let i = 0; i < this.dataService.stages.length; i++) {
      let category = this.dataService.stages[i];
      // category.isSelected = "category-not-selected";
      // category.isSelected = (this.editorService.selectedCategory!="")?"category-selected":"category-not-selected";
      this.categoryList.push(category);
    }

    // this.util.getFromStorage('drafts').then((drafts:any)=>{
    //   console.log(JSON.parse(drafts));
    //   // JSON.parse(drafts).find(o=>{
    //   //   console.log(o.status);
    //   // });
    // });


    // this.publishPost();


    console.log("Options: ", this.options);

    this.editorService.editor.userid = this.userService.currentUserId;



    if(!this.editorService.editor.new){
      console.log("NOT NEW");
      this.editorService.editor = this.options;
      if(this.options.isQuill){
        this.editorService.editor.description.content.setContents(this.options.description.content, 'api');
        // this.editorService.editor.description.quillContent = this.options.description.content.container.firstChild.innerHTML;
        // this.editorService.editor.description.content.setContents(this.editorService.editor.description.content);
      } else {
        this.editorService.editor.media.thumbnail.url = this.options.media.thumbnail.url;
        this.editorService.editor.title = this.options.title;
      }
    } else {
      this.editorService.editor.new = false;
      for (let i = 0; i < this.dataService.stages.length; i++) {
        this.dataService.stages[i].isSelected = 'category-not-selected';
      }
    }

    this.editorService.editor.userid = this.userService.currentUserId;

    console.log("WriteComponentComponent :: ngOnInit() :: END");
  }

  selectCategory(ev:any){
    console.log(ev.target.value.toLowerCase());
    this.editorService.editor.category = ev.target.value.toLowerCase();
    // this.publishQuillPost();
  }

  public contentPlaceholder:string = 'Your content here...'

  public titlePlaceholder:string = 'Title';

  clearText(placeholder){
    console.log(placeholder);

    if(placeholder=='title'){
      this.titlePlaceholder = '';
    } else if (placeholder=='content'){
      this.contentPlaceholder = '';
    }
  }

  initializeQuillEditor(){

    var Delta = Quill.import('delta');



    console.log("WriteComponentComponent : initializeQuillEditor : START");

    var toolbarOptions = [
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      ['image', 'blockquote', 'code-block'],

      [{ 'header': 1 }, { 'header': 2 }],               // custom button values
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
      [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
      [{ 'direction': 'rtl' }],                         // text direction

      [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
      [{ 'header': [3, 4, 5, 6, false] }],

      [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
      [{ 'font': [] }],
      [{ 'align': [] }],

      ['clean']                                         // remove formatting button
    ];

    var options = {
      debug: 'warn',
      modules: {
        //toolbar: '#toolbar'
        toolbar: toolbarOptions,
        history: {
          delay: 2000,
          maxStack: 500,
          userOnly: true
        }
      },
      placeholder: 'Impact the world...',
      readOnly: false,
      theme: 'bubble'
    };

    this.editorService.initializeEditor();

    this.editorService.editor.isQuill = true;

    this.editorService.editor.description.content = new Quill('#editor', options);  // First matching element will be used

    this.editorService.editor.description.content.focus();

    // Store accumulated changes
    var change = new Delta();
    let self = this;
    this.editorService.editor.description.content.on('text-change', function(delta) {
      self.editorService.dirty = true;
      self.editorService.editor.isDraft = true;
      change = change.compose(delta);
    });

    // Save periodically
    setInterval(function() {
      if (change.length() > 0) {
        console.log('Saving changes', change);
        /*
        Send partial changes
        $.post('/your-endpoint', {
          partial: JSON.stringify(change)
        });

        Send entire document
        $.post('/your-endpoint', {
          doc: JSON.stringify(quill.getContents())
        });
        */
        change = new Delta();
      }
    }, 5*1000);


    console.log("WriteComponentComponent : initializeQuillEditor : END");

  }

  async selectImage() {
    const actionSheet = await this.actionSheetController.create({
      header: "Select Image source",
      buttons: [{
        text: 'From Internet',
        handler: () => {
          this.searchImages();
        }
      },
      {
        text: 'From Phone',
        handler: () => {
          this.util.presentLoading('Loading Image...');
          this.util.pickImage(this.camera.PictureSourceType.PHOTOLIBRARY).then((profile:any)=>{
            console.log("After picking Image: ", profile);
            this.editorService.editor.media.profile = {};
            this.editorService.editor.media.profile.filePath = profile.filePath;
            this.editorService.editor.media.profile.imageName = profile.imageName;
            this.editorService.editor.media.profile.userId = this.userService.currentUserId;
            this.editorService.editor.media.profile.title = this.editorService.editor.title;
            this.editorService.editor.media.thumbnail.url = this.util.croppedImagepath;
            this.editorService.editor.media.standard_resolution.url = this.util.croppedImagepath;
            this.editorService.editor.media.low_resolution.url = this.util.croppedImagepath;
            this.util.dismissLoading();
          });
          // this.util.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY, {userId: this.userService.currentUserId, title: this.editorService.editor.title})
          // .then((image:any)=>{
          //   console.log("Added Image: ", image);
          // this.util.startUpload(0, {userId: this.userService.currentUserId, title: this.editorService.editor.title});
          // });
        }
      },
      {
        text: 'Use Camera',
        handler: () => {
          this.util.presentLoading('Loading Image...');
          this.util.pickImage(this.camera.PictureSourceType.CAMERA).then((profile:any)=>{
            console.log("After picking Image: ", profile);
            this.editorService.editor.media.profile = {};
            this.editorService.editor.media.profile.filePath = profile.filePath;
            this.editorService.editor.media.profile.imageName = profile.imageName;
            this.editorService.editor.media.profile.userId = this.userService.currentUserId;
            this.editorService.editor.media.profile.title = this.editorService.editor.title;
            this.editorService.editor.media.thumbnail.url = this.util.croppedImagepath;
            this.editorService.editor.media.standard_resolution.url = this.util.croppedImagepath;
            this.editorService.editor.media.low_resolution.url = this.util.croppedImagepath;
            this.util.dismissLoading();
          });
          // this.util.takePicture(this.camera.PictureSourceType.CAMERA, {userId: this.userService.currentUserId, title: this.editorService.editor.title})
          // .then((image:any)=>{
          //   console.log("Added Image: ", image);
          // this.util.startUpload(0, {userId: this.userService.currentUserId, title: this.editorService.editor.title});
          // });
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
      ]
    });
    await actionSheet.present();
  }

  calculateImageSize(base64String){
    let padding, inBytes, base64StringLength;
    if(base64String.endsWith("==")) padding = 2;
    else if (base64String.endsWith("=")) padding = 1;
    else padding = 0;

    base64StringLength = base64String.length;
    console.log("Base64 Size: length: ", base64StringLength)
    inBytes =(base64StringLength / 4 ) * 3 - padding;
    console.log("Base64 Size: bytes: ", inBytes);
  }

  openOptionsList(ev: any){
  	let payload:any = {
        buttons: [
          // {
          //           text: 'Find Meaning',
          //           role: 'secondary',
          //           icon: 'search-outline',
          //           handler: () => {
          //             console.log('Find Meaning clicked');
          //             this.doSearch();
          //           }
          //         },
                  // {
                  //   text: 'Proof Read',
                  //   role: 'success',
                  //   icon: 'color-wand-outline',
                  //   handler: () => {
                  //     console.log('Proof read clicked');
                  //     this.proofRead(ev);
                  //   }
                  // },
                  {
                    text: 'Discard',
                    role: 'destructive',
                    icon: 'trash',
                    handler: () => {
                      console.log('Discard clicked');
                      this.dismiss();
                    }
                  }]
    };
    // [
      //     // {
        //     //   text: 'Archieve',
        //     //   callback: ()=>{
          //     //
          //     //   }
          //     // },
          //     {
            //       text: 'Discard',
            //       callback: ()=>{
              //         console.log('Discard clicked');
              //         this.dismiss();
              //       }
              //     }
              //   ]
  	this.util.presentActionSheet('Action', payload.buttons);
  }

  toggleColorPalette(ev: any){
  	this.editorService.colorPaletteShow = !this.editorService.colorPaletteShow;
  	// let payload:any = {
   //      theme: 'dark'
   //  }
  	// this.util.presentPopover(null, ColorPaletteComponent, payload);
  }

	async updateTitle(ev:any){

    this.isImagesClosed = true;
    this.isCollapsed = false;

  	this.editorService.editor.title = ev.target.value;//.concat(this.omit_special_char(ev));//await this.omit_special_char(ev.detail.data);
    this.editorService.dirty = true;
    // console.log((this.editorService.editor.title=="")&&(this.editorService.editor.subtitle=="")&&(this.editorService.editor.description.content==""));
    // console.log((this.editorService.editor.title==""),(this.editorService.editor.subtitle==""),(this.editorService.editor.description.content==""));

    if((this.editorService.editor.title=="")&&(this.editorService.editor.subtitle=="")&&(this.editorService.editor.description.content=="")){
      this.editorService.dirty = false;
    }
    // console.log("Dirty updated: ", this.editorService.dirty);
    // this.editorService.editor.status = (this.editorService.editor.title!=""||this.editorService.editor.description.content!="")?'Draft':'New';
  }

  omit_special_char(key) // Ref: https://stackoverflow.com/questions/45072369/how-to-restrict-special-characters-in-the-input-field-using-angular-2-typescri
  {
    let k = key.charCode;
    console.log(k);
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57));
  }


  updateSubTitle(ev:any){
    this.editorService.editor.subtitle = ev.target.value;
    this.editorService.dirty = true;

    if((this.editorService.editor.title=="")&&(this.editorService.editor.subtitle=="")&&(this.editorService.editor.description.content=="")){
      this.editorService.dirty = false;
    }
    // console.log("Dirty updated: ", this.editorService.dirty);
    // this.editorService.editor.status = (this.editorService.editor.title!=""||this.editorService.editor.subtitle!="")?'Draft':'New';
  }

  updateBody(ev:any){
  	this.editorService.editor.description.content = ev.target.value;
    this.editorService.dirty = true;

    if((this.editorService.editor.title=="")&&(this.editorService.editor.subtitle=="")&&(this.editorService.editor.description.content=="")){
      this.editorService.dirty = false;
    }
    // console.log("Dirty updated: ", this.editorService.dirty);
    // this.editorService.editor.status = (this.editorService.editor.description.content!=""||this.editorService.editor.title!="")?'Draft':'New';
  }

  titleOnBlur(ev: any){
  	// this.searchImages(ev);
    console.log("WriteComponentComponent : titleOnBlur() : BLUR");
    this.editorService.editor.title = ev.target.value.replace('.', '');
    this.editorService.editor.title = ev.target.value.trim();
  }

  subtitleOnBlur(ev: any){
    console.log("WriteComponentComponent : subtitleOnBlur() : BLUR");
    this.editorService.editor.subtitle = ev.target.value.trim();
  }

  bodyOnBlur(ev: any){
    console.log("WriteComponentComponent : bodyOnBlur() : BLUR");
  }

  public searchAttempt:number = 0;
  public isImagesClosed:any = true;
  public isCollapsed:any = false;

  public showHashtag:any = false;

  addImage(img){
    console.log(img, this.editorService.editor);
    this.editorService.editor.media.thumbnail.url = img.urls.thumb;
    this.editorService.editor.media.standard_resolution.url = img.urls.regular;
    this.editorService.editor.media.low_resolution.url = img.urls.small;
    this.isImagesClosed = true;
    // this.editorService.editor.color = img.color;

    // Hshtag from the selected image
    //
    this.editorService.editor.tags = [];
    // for (let k = 0; k < img.tags.length; k++) {
    //   if(this.editorService.editor.tags.indexOf(img.tags[k].title)==-1){
    //     this.editorService.editor.tags.push(img.tags[k].title);
    //   }
    // }
  }

  confirmSearchImages(ev: any){
    let buttons = [{
        text: 'Remove',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          console.log('Remove clicked');
          this.editorService.editor.media.thumbnail.url = '';
          this.editorService.editor.media.standard_resolution.url = '';
          this.editorService.editor.media.low_resolution.url = '';
        }
      }, {
        text: 'Change',
        icon: 'refresh-outline',
        handler: () => {
          console.log('Change clicked');
          this.editorService.dirty = true;
          this.editorService.editor.media.low_resolution.url = '';
          this.editorService.editor.media.standard_resolution.url = '';
          this.editorService.editor.media.thumbnail.url = '';
          this.searchImages(ev);
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }];
   this.editorService.editor.new?this.util.presentActionSheet('Featured Image', buttons):null;
  }

  public images:any = [];
  public pages:any = [];

  searchImages(index?:number){

    // ev = [];

    // this.isImagesClosed = false;

    // document.getElementById('body').scrollBy(0, 500);
    // this.scrollComponent.scrollTo(0,500);

    // console.log(ev);

    ++this.searchAttempt;

    let payload = {
      searchAttempt: this.searchAttempt,
      images: this.dataService.posts
    }

    // this.imagesService.searchImages(this.editorService.editor.title, this.searchAttempt).then((response:any)=>{
    //   console.log(response);
    // });

    if(this.editorService.editor.title!=''){
      this.isImagesClosed = false;
      this.util.presentLoading('Searching apt images and tags...');
      this.imagesService.searchImages(this.editorService.editor.title, index?index:this.searchAttempt).then(response=>{
        console.log(response);
        this.images = [];
        this.images = response;

        // Hashtags from all the images:
        //
        // for (let j = 0; j < response.results.length; j++) {
        //   for (let k = 0; k < response.results[j].tags.length; k++) {
        //     if(this.editorService.editor.tags.indexOf(response.results[j].tags[k].title)==-1){
        //       this.editorService.editor.tags.push(response.results[j].tags[k].title);
        //     }
        //   }
        // }

        if(this.images.total>0){
          console.log(this.images);
          for (var i = 1; i < this.images.total/9; ++i) {
            this.pages.push(i);
          }
        } else {
          this.util.dismissLoading();
          this.util.presentAlert('Title seems different!', 'Please alter title to search!');
        }
        this.util.dismissLoading();
      });
    } else {
      this.isImagesClosed = true;
      console.log("we are now in the else of write-componentcomponent.ts in line 281")
      this.searchAttempt = 0;
    }


    // this.util.presentModal(ImageSearchComponent, payload);

    // .then(res=>{
    //   console.log(res);
    //   this.images = res;
    // });
  // 	this.imagePicker.getPictures(options).then((results) => {
		//   for (var i = 0; i < results.length; i++) {
		//       console.log('Image URI: ' + results[i]);
		//   }
		// }, (err) => { });
  }

  updatePost(){
    console.log("WriteComponentComponent :: updatePost() :: START");

    console.log(this.editorService.editor);

    if(this.editorService.dirty){
      this.editorService.validateEditor().then((warn:any)=>{
        if(warn==null){

          // this.util.presentModal(WriterOptionsComponent, {dirty:this.editorService.dirty, isCategory: true}, 'WriterOptionsComponent');

          // same as calling writeroptions component except without the category list.
          this.editorService.editor.userid = this.editorService.editor.user.userid;
          this.util.presentLoading('Publishing changes...');
          this.util.dismissModal(this);
          //this.util.dismissLoading();
          this.dataService.updatePost(this.editorService.editor).then((res:any)=>{
           // this.util.dismissModal(this);
           this.util.dismissLoading();
           let self = this;
            setTimeout(function(){
              self.util.dismissModal(self);
            }, 1000);
            // this.api.post('updateStreaks', {}).subscribe((res:any)=>{
            //   console.log('Streaks Updated');
            // });

            //show message
            // this.editorService.resetEditor();
            this.editorService.editor.me = true;
            this.editorService.selectedCategory = "";
            this.editorService.dirty = false;
            // this.editorService.status = 'close';
            //this.util.dismissModal(this, 'WriteComponentComponent');
            this.util.presentToast(res.text, '', 3000);
            console.log("Response: ", res);
          });
        }
        else
          this.util.presentAlert(warn.header, warn.message);
      });
    } else {
      this.util.presentAlert('No new changes found', 'You are up to date!');
    }

    console.log("WriteComponentComponent :: updatePost() :: END");
  }


  publishPost(){
    console.log("WriteComponentComponent :: publishPost() :: START");

    console.log(this.editorService.editor);

    if(this.editorService.dirty){

      this.editorService.validateEditor().then((warn:any)=>{
        if(warn==null) {
          if(this.editorService.editor.media.thumbnail.url==''){

            let buttons = [{
                text: 'Auto-pick an image for me!',
                // role: 'destructive',
                icon: 'image-outline',
                handler: () => {
                  console.log('Auto clicked');
                  this.util.presentModal(WriterOptionsComponent, {dirty:this.editorService.dirty, isCategory: true}, 'WriterOptionsComponent');
                }
              }, {
                text: 'Choose from Images',
                icon: 'images-outline',
                // role: 'cancel',
                handler: () => {
                  console.log('Add an Image clicked');
                  this.searchImages(1);
                }
              }, {
                text: 'Cancel',
                icon: 'close',
                role: 'cancel',
                handler: () => {
                  console.log('Cancel clicked');
                }
              }];

            this.util.presentActionSheet('Continue without Image?', buttons);

          } else {
            this.util.presentModal(WriterOptionsComponent, {dirty:this.editorService.dirty, isCategory: true}, 'WriterOptionsComponent');
          }
        } else {
          this.util.presentAlert(warn.header, warn.message);
        }
      });
    } else {
      this.util.presentAlert('No content found', 'Please type your content?');
    }

    console.log("WriteComponentComponent :: publishPost() :: END");
  }

  publishQuillPost(){
    let self = this;

    if(this.editorService.dirty){

    this.editorService.validateEditor().then((warn:any)=>{
      if(warn==null) {

        if(this.editorService.editor.media.thumbnail.url==''){

          let buttons = [{
              text: 'Choose from Images',
              icon: 'images-outline',
              // role: 'cancel',
              handler: () => {
                console.log('Add an Image clicked');
                this.selectImage();
                // this.searchImages(1);
              }
            }, {
              text: 'Cancel',
              icon: 'close',
              role: 'cancel',
              handler: () => {
                console.log('Cancel clicked');
              }
            }];

          this.util.presentActionSheet('Continue without Image?', buttons);

        } else {
          // console.log(this.editorService.editor.description.content.getText(0,this.editorService.editor.description.content.getLength()-1)+'...');
          // this.editorService.editor.description.quillContent = this.editorService.editor.description.content.getText(0,this.editorService.editor.description.content.getLength()-1)+'...'
          this.editorService.editor.description.quillContent = this.editorService.editor.description.content.container.firstChild.innerHTML;
          this.editorService.editor.description.content = this.editorService.editor.description.content.getContents();
          // this.editorService.editor.quillDescription =
          this.editorService.editor.userid = this.userService.currentUserId;
          // console.log("QuillContent: ", this.editorService.editor.description.quillContent);
          if(!this.editorService.editor.isDraft&&!this.editorService.editor.new){
            this.editorService.editor.status = 'Edited';
            this.util.presentLoading('Publishing changes...', 30000);
            this.util.dismissModal(this);
            this.editorService.editor.isDraft = false;
            this.dataService.updatePost(this.editorService.editor).then((res:any)=>{
              this.util.removeEditorFromLocal(this.editorService.editor);
              this.util.dismissModal(this);
              this.util.dismissLoading();
              this.editorService.editor.me = true;
              this.editorService.selectedCategory = "";
              this.editorService.dirty = false;
              this.editorService.status = 'close';
              //this.util.dismissModal(this, 'WriteComponentComponent');
              this.util.presentToast(res.text, '', 3000);
              console.log("Response: ", res);
            });

          } else {
            this.editorService.editor.comment = [];
            this.editorService.editor.status = 'Published';
            this.util.presentLoading('Publishing...', 30000);
            this.util.dismissModal(this);
            this.editorService.editor.isDraft = false;
            this.dataService.publishPost(this.editorService.editor).then((res:any)=>{
              if(res.status == 200){
                this.util.removeEditorFromLocal(this.editorService.editor);
                this.util.dismissLoading();
                this.util.dismissModal(this);
                this.editorService.editor.me = true;
                this.editorService.selectedCategory = "";
                this.editorService.dirty = false;
                this.editorService.status = 'close';
                this.util.presentToast(res.text, '', 3000);
                console.log("Response: ", res);
              }else{
                this.util.dismissLoading();
                this.util.presentToast(res.text, '', 3000);
                console.log("Response: ", res);
              }
            });
          }
        }

        // this.util.setToStorage('q', this.editorService.editor.description.content.getContents());
        // self.editorService.editor.description.content.setContents('', 'user');
        // this.util.getFromStorage('q').then(val=>{
        //   console.log(val);
        //   setTimeout(() => {
        //     this.editorService.editor.description.content.setContents(val, 'user');
        //   }, 2000);
        // });



    //   } else {
    //     this.util.presentAlert('Category Missing', 'Please choose a category above');
    //   }
    // } else {
    //   this.util.presentAlert('Content Missing', 'You are yet to type your content');
    // }
      } else {
        this.util.presentAlert(warn.header, warn.message);
      }
    });
    }
  }

  searchUpdate(ev: any){
    this.searchQuery = ev.target.value;
  }

  doSearch(){
    if(this.searchQuery!=""||this.searchQuery==null||this.searchQuery==undefined){

      this.api.post('dictionary', {inputWord: this.searchQuery}).subscribe((meaning:any)=>{
        console.log(meaning);
        this.isSearchOpen = false;
        this.util.presentAlert('Meaning', meaning.response.definitions, null,this.searchQuery);
        this.searchQuery = "";
      });
    } else {
      this.util.presentAlert('Oops!', 'Please enter a word to search');
      this.searchQuery = "";
    }
  }

  public isSearchOpen:boolean = false;

  public searchQuery:string = "";

  findMeaning(){ //dictionary
    this.isSearchOpen = true;
  }

  proofRead(ev: any){
    let content = this.editorService.editor.description.content;

    this.editorService.validateEditor().then((warn:any)=>{
      if(warn==null){
        this.util.presentLoading('Filtering offensive words...')
        this.api.post('filterOffensiveWords', {text:this.editorService.editor.description.content}).subscribe((sentence:any)=>{
         this.util.dismissLoading();
         this.editorService.editor.description.content = sentence.filteredText;
         this.util.presentLoading('Checking for grammatical mistakes...')
          this.api.post('grammarCorrection', {sentence:this.editorService.editor.description.content}).subscribe((mistakes:any)=>{
            this.util.dismissLoading();
            console.log(mistakes.result);

            if(mistakes.result==undefined||mistakes.result.matches==undefined){
               this.util.presentAlert("", "", null,'No Errors, Great! You\'re becoming a pro');
            } else {

              let matches = mistakes.result.matches;

              for (let i = 0; i < matches.length; i++) {
                for (let j = 0; j < matches[i].replacements.length; j++) {
                  matches[i].replacements[j].isSelected = false
                }
              }

              this.util.presentModal(GrammarComponent, {matches: matches, text: 'Here are a few Improvements for you!'}, 'GrammarComponent');
            }
          });
        });
      }
      else
        this.util.presentAlert(warn.header, warn.message);
    });
  }

  applyGrammarCorrections(){
    console.log("applyGrammarCorrections", this.editorService.grammarCorrections);
    let corrections = this.editorService.grammarCorrections;
    let content = this.editorService.editor.description.content;

    this.util.presentLoading('Applying changes...');

    for (let i = 0; i < corrections.length; i++) {
      content = content.replace(content.substr(corrections[i].context.offset, corrections[i].context.length), corrections[i].replacement.value);
    }

    setTimeout(() => {
      this.editorService.editor.description.content = content;
      this.editorService.grammarCorrections = [];
      this.util.dismissLoading();
    }, 1000);

  }

  // constructor(
  // 	private modalCtrl: ModalController
  // ) {

  // 	console.log(this.header);

  // 	this.toolbarOptions = [
		//   ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
		//   ['blockquote', 'code-block'],

		//   [{ 'header': 1 }, { 'header': 2 }],               // custom button values
		//   [{ 'list': 'ordered'}, { 'list': 'bullet' }],
		//   [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
		//   [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
		//   [{ 'direction': 'rtl' }],                         // text direction

		//   [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
		//   [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

		//   [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
		//   [{ 'font': [] }],
		//   [{ 'align': [] }],

		//   ['clean']                                         // remove formatting button
		// ];

		// this.options = {
		// 	modules: {
		//     toolbar: this.toolbarOptions
		//   },
		//   theme: 'snow'
		// }

  // }

  confirmDismiss(){
    let buttons = [{
        text: 'Discard',
        role: 'destructive',
        handler: () => {
          this.editorService.dirty = false;
          this.dismiss();
        }
      // }
      // , {
      //   text: 'Save as Draft',
      //   handler: () => {
      //     console.log('Save as Draft');
      //     this.editorService.dirty = false;
      //     this.editorService.editor.created_datetime = this.editorService.editor.isDraft?this.editorService.editor.created_datetime:new Date();
      //     this.util.saveEditorToLocal(this.editorService.editor);
      //   }
      }];
    this.util.presentAlert('Are you sure?', 'You seem to have some unsaved changes!', buttons);
  }

  dismiss(isForceClose?:boolean) {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    // this.modalCtrl.dismiss({
    //   'dismissed': true
    // });
    console.log("Dirty: ", this.editorService.dirty);
    if(this.editorService.dirty){
      this.confirmDismiss();
    } else {
      this.editorService.resetEditor();
      this.util.dismissModal(this);
    }
  }

}
