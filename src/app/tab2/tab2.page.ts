import { Component, ViewChild } from '@angular/core';
import { IonInfiniteScroll,IonContent } from '@ionic/angular';

import { PostDetailComponent } from '../components/post-detail/post-detail.component';
import { WriteComponentComponent } from '../components/write-component/write-component.component';
import { WriterOptionsComponent } from '../components/writer-options/writer-options.component';
import { ProfileComponent } from '../components/profile/profile.component';

import { DataService	} from '../services/data.service';
import { UtilService	} from '../services/util.service';
import { UserService 	} from '../services/user.service';
import { EditorService 	} from '../services/editor.service';
import { ApiService 	} from '../services/api.service';
import { NetworkService 	} from '../services/network.service';
import { ScheduleService } from "../services/schedule.service";
import { TimeService } from "../services/time.service";

import { SearchPage } from '../pages/search/search.page';

import * as Quill from 'quill';
import { Content } from '@angular/compiler/src/render3/r3_ast';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

	@ViewChild(IonInfiniteScroll, {static: true}) infiniteScroll: IonInfiniteScroll;

  @ViewChild('feed') feed: any;
  @ViewChild('feedTop') feedTop: IonContent;

  public dataList:any;

  public content:any = {};

  // public toggled: boolean = false;

  public isLoaded:boolean = false;

  public currentCategory:string = "";
  public currentCategoryObj:any = {};

  public categoryLastUpdated:string = "";

  public openSearch:boolean = false;
  public openNotifications:any;

  constructor(
  	public data: DataService,
    public userService: UserService,
  	public editorService: EditorService,
    public util: UtilService,
    private api: ApiService,
  	public networkService: NetworkService,
    public schedule: ScheduleService,
    public time: TimeService
  ) {
  	this.content.title = "Kids";
    this.dataList = [];
    // this.toggled = false;
    this.util.getFromStorage('isGridView').then((isGridView:boolean)=>{
      this.util.gridView = isGridView?isGridView:false;
    });

  }

  ngOnInit(){

    // this.loadPostsByCategory();

  }

  ionViewDidEnter(){
    this.loadAllPosts();
  }

  // double click to scrolltoTop
  // ionSelected(){
  //   this.feedTop.scrollToTop();
  // }

  loadAllPosts(){
    this.util.presentLoading('Loading all posts...');
    this.data.getAllPosts().then((res:any)=>{
      this.isLoaded = res?true:false;
      this.currentCategory = '';
      // this.sanitizeQuillPosts();
      this.util.dismissLoading();
    });
  }

  loadPostsByCategory(category){
    this.data.getPostByCategory(category.name?category.name.toLowerCase():"kids", true).then((value:any)=>{

      this.currentCategory = category.name;
      this.currentCategoryObj = category;

      // this.sanitizeQuillPosts();

      this.scrollToPosts();

      this.isLoaded = value?true:false;
      this.data.posts = (value.length!=undefined)?value:null;
      console.log(value);

      if(this.data.posts){
        for (let i = 0; i < 10; i++) {
          this.dataList.push(this.data.posts[this.dataList.length]);
        }
      }

      this.util.getFromStorage(this.currentCategory+'LastUpdated').then((time:any)=>{
        console.log("Last Updated: ", time);
        this.categoryLastUpdated = time;
      });

    });
  }

  sanitizeQuillPosts(){

    var options = {
      debug: 'warn',
      modules: {
        //toolbar: '#toolbar'
      },
      placeholder: 'Click to view the complete content',
      readOnly: true,
      theme: 'bubble'
    };

    for (let i = 0; i < this.data.posts.length; ++i){

      if(this.data.posts[i].isQuill){
        let quill = new Quill('.editor', options);
        this.data.posts[i].description.quillContent = quill;
        this.data.posts[i].description.quillContent.setContents(this.data.posts[i].description.content, 'api');

      }

    }
  }

  resetCategory(){
    this.loadAllPosts();
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

  scrollToPosts(duration?:number) {
      setTimeout(() => {
          if (this.feed.scrollToPoint) {
              this.feed.scrollToPoint(0, 300, 500);
          }
      }, duration?duration:500);
  }

  public showUpdateCategory:any = false;

  segmentChanged(ev: any) {
		// console.log('Segment changed', ev.detail);

    this.content.title = ev.detail.value;
    this.currentCategory = ev.detail.value.toLowerCase();
    this.showUpdateCategory = false;

    this.util.getFromStorage(this.currentCategory+'LastUpdated').then((time:any)=>{
      console.log("Last Updated: ", time);
      this.categoryLastUpdated = time;
      let isForceFetch = (new Date().getTime()-new Date(time).getTime()>100000)?true:false;
      if(isForceFetch){
        this.util.setToStorage(this.currentCategory+'LastUpdated', new Date());
        // this.categoryLastUpdated = new Date();
        this.showUpdateCategory = true;
      }

      this.data.getPostByCategory(this.currentCategory?this.currentCategory.toLowerCase():"kids").then((value:any)=>{
        console.log("data.getPostByCategory() : count", value.length);

        this.data.posts = (value.length!=undefined)?value:null;
      });
    });

    // if(!this.isLoaded){

    // } else {

    // }
	}

	doRefresh(event) {
    console.log('Begin async operation');

    this.schedule.scheduleSingle();
    this.schedule.scheduleLater("Delayed Notification", new Date(this.time.getDelayedTime(10, 'seconds')));

    this.data.getAllPosts().then(res=>{
      this.isLoaded = res?true:false;
      event.target.complete();
      console.log('End async operation');
    });
    // this.data.getPostByCategory(this.currentCategory?this.currentCategory.toLowerCase():"kids", true).then((value:any)=>{
    //   console.log("data.getPostByCategory() : ", value);
    //   this.data.posts = (value.length!=undefined)?value:null;
    //   this.categoryLastUpdated = null;
    //   event.target.complete()?event.target.complete():null;
    //   this.showUpdateCategory = false;
    //   console.log('End async operation');
    // });
  }

  loadData(event) {
    if(this.dataList.length<10){
      event.target.disabled = true;
    } else {
      setTimeout(() => {
        console.log('Done');
        for (let i = 0; i < 10; i++) {
          this.dataList.push(this.data.posts[this.dataList.length]);
        }
        event.target.complete();

        // App logic to determine if all data is loaded
        // and disable the infinite scroll
        if (this.dataList.length == 1000) {
          event.target.disabled = true;
        }
      }, 500);
    }
  }

  toggleInfiniteScroll() {
    this.infiniteScroll.disabled = !this.infiniteScroll.disabled;
  }

  openPostDetail(post,postsArray){
    post.headerText = this.content.title;
    let postData = {
      post:post,
      postsArray:postsArray
    }
    console.log("Tab2Page : openPostDetail() : ", post);
    post.me = false;
    this.util.presentModal(PostDetailComponent, postData, 'PostDetailComponent');
  }

  openWriteComponent(){
    console.log("Tab1Page :: openWriteComponent()");

    this.editorService.initializeEditor();

    this.util.presentModal(WriteComponentComponent, {me:true, new: true}, 'WriteComponentComponent', false);
  }

  ratePostFromFeed(post_id, rating){
    console.log(rating);
    let rate = {
    	post_id: post_id,
    	value: rating,
    	userid: this.userService.currentUserId,
    }
    // this.post.rating.find(o => o.userid === this.userService.currentUserId).value
    this.api.post('addRatingsByPostId', rate).subscribe(res=>{
      console.log('addRatingsByPostId', res);

    });
  }

  dropDownOptions(ev: any){
    let payload = {
      isList: true,
      listItems: [
        {
          text: 'Settings',
          handler: 'openSettingsPage'
        }, {
          text: 'Logout',
          handler: 'logout'
        }
      ]
    }
    this.util.presentPopover(ev, WriterOptionsComponent, payload);
  }

  openSearchModal(ev: any){
    let payload = {
      isSearch: true
      // listItmes: [
      //   {
      //     authourName:'',
      //     profilePic:'',
      //     username:'',
      //     role:'',
      //     handler: 'openProfilePage'
      //   }
      // ]
    }
    this.util.presentModal(SearchPage, payload, 'SearchPage', true);
  }

  openProfilePage(item){
    console.log("inside openProfilePage: ",item);
    this.util.presentModal(ProfileComponent,item,'ProfileComponent',false);
  }


}
