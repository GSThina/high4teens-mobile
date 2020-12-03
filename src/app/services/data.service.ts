import { Injectable		} from '@angular/core';

import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { APP_VERSION } from "../../environments/environment";

import { UtilService	} from './util.service';
import { DatabaseService	} from './database.service';
import { ApiService	} from './api.service';
import { TimeService	} from './time.service';
import { SocketioService } from './socketio.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public dummyimage:string = "../../assets/img/logo-icon.png";

  public isNewUpdateAvailable:boolean = false;

  constructor(
  	private util: UtilService,
  	private db: DatabaseService,
    private api: ApiService,
    private timeService: TimeService,
    public socketio: SocketioService,
  ) {
  	this.profileToPostDataMatchUp();
    this.getAllCategories();
    this.checkForNewUpdates();
    // this.categoryList = this.stages;

  }

  checkForNewUpdates(){
    var appVersion = APP_VERSION;
    this.api.post('checkForUpdates',{id:appVersion, byPassJwt: "098098"}).subscribe((res:any)=>{
      //console.log("response: ",res);
      this.isNewUpdateAvailable = (res.status==200)?true:false;
      // userid needs to be sent as a parameter in the below line, when importing userservice, circular dependency error occurs.
      // (this.isNewUpdateAvailable)?(this.socketio.emit("app-update",{room:"AppUpdate",userid:"",event:"app-update"})):(console.log("Inside the check for new updates function, since no updates available no events triggered."));
      console.log("isNewUpdateAvailable :: ", res, this.isNewUpdateAvailable);
    });
  }

  getAllCategories(){
    // this.categoryList = this.stages;
  }

  getCurrentUser(payload){
    // console.log("DataService : getCurrentUser() : ", id);
    // this.util.presentLoading('Loading your info');
    // console.log("currentUser payload: ",payload)
    return new Promise((resolve, error) => {
      this.api.post('getUserDetailsByUserId', payload).subscribe(res=>{
        // this.util.dismissLoading();
        console.log("getUserDetailsByUserId: ", res);
        resolve(res);
      });
    });
  }

  // getCurrentUserPosts(payload){
  //   return new Promise((resolve, error) => {
  //     this.api.post('getPostByUserId', payload).subscribe(res=>{
  //       resolve(res);
  //     });
  // 	});
  // }

  getUserDetailsByName(payload){
    console.log("getUserDetailsByName payload: ",payload);
    return new Promise((resolve, error) => {
      this.api.post('getUserDetailsByName', payload).subscribe(res=>{
        // this.util.dismissLoading();
        console.log("getUserDetailsByName response: ", res);
        resolve(res);
      });
    });
  }

  getPostsByTitle(payload){
    return new Promise((resolve, error) => {
      console.log("getPostsByTitle payload: ",payload);
      this.api.post('getPostsByTitle', payload).subscribe(res=>{
        // this.util.dismissLoading();
        console.log("getPostsByTitle response: ",res);
        resolve(res);
      });
  	});
  }

  getPostByPostId(post_id: string){
    return new Promise((resolve, error)=>{
      this.api.post('getPostByPostId', {post_id: post_id}).subscribe(response=>{
        console.log(response);
        resolve(response[0]);
      });
    })
  }

  getPostByCategory(category: string, isForceFetch?: boolean){
    // this.util.presentLoading('Loading category');
    return new Promise((resolve, error) => {

      // if(!isForceFetch){
        this.util.getFromStorage('category').then((localCat:any)=>{

          if (localCat==null){
            console.log("Newly Setting localCat to {}");
            localCat = {};
          }

          if (localCat[category]==null||isForceFetch) {
            console.log(isForceFetch?"isForceFetch":"Opening New Category");

            console.log("Fetching categories from server");
            this.util.presentLoading('Fetching posts...');
            this.api.post('getPostByCategory', {"category": category}).subscribe((res:any)=>{
              localCat[category] = res;
              this.util.dismissLoading();
              this.util.setToStorage('category', localCat);
              this.util.setToStorage(category+'LastUpdated', this.timeService.getTime());
              resolve(localCat[category]);
            });
          } else {
            console.log("Fetching categories from localCat");
            console.log(localCat);
            resolve(localCat[category]);
          }
        });
      // } else {
        // resolve(localCat[category]);
        // this.api.post('getPostByCategory', {"category": category}).subscribe((res:any)=>{
        //   localCat[category] = res;
        //   this.util.setToStorage('category', localCat);
        // });
      // }

    });
  }

  getAllPosts(){
    // this.util.presentLoading('Loading all posts');
  	return new Promise((resolve, error) => {
      this.api.get('getAllPosts').subscribe(res=>{
        this.posts = [];
        this.posts = res;
        // this.util.dismissLoading();
        resolve(true);
      });
  	});
  }

  profileToPostDataMatchUp(){
  	for (var i = this.posts.length - 1; i >= 0; i--) {
  		this.posts[i%this.posts.length].user = this.users[i];
  		// this.posts[i%this.posts.length].category = this.categories[Math.floor(Math.random()*this.categories.length)];
  	}
  }

  getAllPostsById(id){
  	// this.db.getList('URL', id, ['wefw','awefaw']).then(val=> {
  	// 	console.log(val);
  	// });

  }

  getAllPostsByCategory(category){
		// return new Promise((resolve, reject)=>{
		// 	this.db.getList('URL', category, ['wefw','awefaw']).then(val=> {
	 //  		console.log(val);
	 //  	});
		// });
  }

  publishPost(post){
    // this.util.presentLoading('Publishing your creation');
    return new Promise((resolve, error) => {
      this.api.post('addPostByUserId', post).subscribe((res:any)=>{
        // this.util.dismissLoading();
        console.log("Newly added post: ", res);

        if(res.status == 200){
          this.socketio.subscribeToRoom(res.post_id,post.user.userid);
          this.socketio.emit("all-posts",{
            room:"AllPosts",
            userid:post.user.userid,
            full_name:post.user.full_name,
            post_id:res.post_id,
            thumbnail:post.media.thumbnail.url,
            data: post,
            event:"all-posts"
          })
          this.socketio.emit("new-post",{
            room:post.user.userid,
            userid:post.user.userid,
            full_name:post.user.full_name,
            post_id:res.post_id,
            thumbnail:post.media.thumbnail.url,
            data: post,
            event:"new-post"
          })
        }
        resolve(res);
      });
  	});
  }

  updatePost(post){
    // this.util.presentLoading('Publishing your creation');
    return new Promise((resolve, error) => {
      this.api.put('editPostByPostId', post).subscribe(res=>{
        // this.util.dismissLoading();
        resolve(res);
      });
  	});
  }

  // loadData(path){
  // 	this.util.readTextFile(path, function(text){
		//     let data = JSON.parse(text);
		//     return data;
		// });
  // }

  public badges = //[];
  [
  {
    "name": "Top Contributor",
    "code": "TC",
    "points": 25,
    "description": "This badge belongs to you, when you are contributing more than a post for a day, consistently for at least 5 days.",
    "expiry": "03-months",
    "privilige": "You can now view the detailed insight of your posts",
    "order": 0,
    "type": "badge"
  },
  {
    "name": "Known For Consistency",
    "code": "KFC",
    "points": 25,
    "description": "This badge belongs to you, when you achieve a 30 days streak",
    "expiry": "03-months",
    "privilige": "You can now provide private feedbacks to the other writers",
    "order": 0,
    "type": "badge"
  },
  {
    "name": "Streak Holder",
    "code": "SH",
    "points": 25,
    "description": "This badge belongs to you, when you achieve a 10 days streak",
    "expiry": "03-months",
    "privilige": "You can now provide private feedbacks to the other writers",
    "order": 0,
    "type": "badge"
  },



  {
    "name": "Most Engaging Post",
    "code": "ME",
    "points": 20,
    "description": "This badge belongs to you, when your post gets the most engagements in a month.",
    "expiry": "03-months",
    "privilige": "You can now view the detailed insight of your posts",
    "order": 0,
    "type": "achievement"
  },
  {
    "name": "Post Of the Week",
    "code": "POW",
    "points": 20,
    "description": "This badge belongs to you, when your post gets the highest rating in a week.",
    "expiry": "01-month",
    "privilige": "You can now view the detailed insight of your posts",
    "order": 0,
    "type": "achievement"
  },
  {
    "name": "10 Days Streak",
    "code": "S10",
    "points": 10,
    "description": "This badge belongs to you, when you post 10 days without missing a day",
    "expiry": "01-month",
    "privilige": "You will now receive the Streak Holder badge",
    "order": 0,
    "type": "achievement"
  },
  {
    "name": "20 Days Streak",
    "code": "S20",
    "points": 20,
    "description": "This badge belongs to you, when you post 20 days without missing a day",
    "expiry": "01-month",
    "privilige": "You will now receive the Streak Holder badge",
    "order": 0,
    "type": "achievement"
  },
  {
    "name": "30 Days Streak",
    "code": "S30",
    "points": 30,
    "description": "This badge belongs to you, when you post 30 days without missing a day",
    "expiry": "01-month",
    "privilige": "You will now receive the Streak Holder badge",
    "order": 0,
    "type": "achievement"
  }
]

  public stages = [
									  {
                      "stage": 0,
                      "age": "0",
									    "name": "General",
									    "icon": "infinite-outline",
                      "isSelected": "category-not-selected"
									  },
                    {
                      "stage": 1,
                      "age": "0-5+",
                      "name": "Kids",
									    "icon": "game-controller-outline",
                      "isSelected": "category-not-selected"
                    },
									  {
                      "stage": 2,
                      "age": "6-18+",
									    "name": "Education",
									    "icon": "school-outline",
                      "isSelected": "category-not-selected"
									  },
									  {
                      "stage": 3,
                      "age": "13-19+",
									    "name": "Teenage",
									    "icon": "fitness-outline",
                      "isSelected": "category-not-selected"
									  },
									  {
                      "stage": 4,
                      "age": "20-35+",
									    "name": "Adult",
									    "icon": "male-female-outline",
                      "isSelected": "category-not-selected"
									  },
									  {
                      "stage": 5,
                      "age": "24-28+",
									    "name": "Marriage",
									    "icon": "heart-half-outline",
                      "isSelected": "category-not-selected"
									  },
									  {
                      "stage": 6,
                      "age": "28-50+",
									    "name": "Parenting",
									    "icon": "body-outline",
                      "isSelected": "category-not-selected"
									  },
									  {
                      "stage": 7,
                      "age": "51-65+",
									    "name": "Grand",
									    "icon": "walk-outline",
                      "isSelected": "category-not-selected"
									  },
									  {
                      "stage": 8,
                      "age": "65+",
									    "name": "Dark",
									    "icon": "finger-print-outline",
                      "isSelected": "category-not-selected"
									  }
                  ];

  public activityType = [
     {
       "code":"btw",
       "name":"Book Of The Week",
       "icon":""
     },
     {
       "code":"pm",
       "name":"Poem Marathon",
       "icon":""
     },
     {
      "code":"il",
      "name":"Inscribed Lines",
      "icon":""
     },
     {
      "code":"cyc",
      "name":"Crave Your Creativity",
      "icon":""
     }
  ];

  public posts:any = [];

//   [{"comments":{"count":82},"caption":{"created_time":"3:01 AM","text":"Release Left Sphenoid Sinus, Percutaneous Endoscopic Approach","from":{"username":"ahonatsch0","full_name":"Aurelia Honatsch","type":"video/mpeg","id":"7173128099"},"id":"5619537234"},"likes":{"count":30},"link":"https://tripadvisor.com/sed/accumsan/felis.html?ut=diam&nunc=cras&vestibulum=pellentesque&ante=volutpat&ipsum=dui&primis=maecenas&in=tristique&faucibus=est&orci=et&luctus=tempus&et=semper&ultrices=est&posuere=quam&cubilia=pharetra&curae=magna&mauris=ac&viverra=consequat&diam=metus&vitae=sapien&quam=ut&suspendisse=nunc&potenti=vestibulum","user":{"username":"ahonatsch0","profile_picture":"http://dummyimage.com/256x256.jpg/ff4444/ffffff","id":"4248712539"},"images":{"low_resolution":{"url":"http://dummyimage.com/512x512.bmp/dddddd/000000","width":512,"height":512},"thumbnail":{"url":"http://dummyimage.com/256x256.jpg/5fa2dd/ffffff","width":256,"height":256},"standard_resolution":{"url":"http://dummyimage.com/730x1024.png/cc0000/ffffff","width":1024,"height":1024}},"type":"application/x-troff-msvideo","filter":"audio/x-mpeg-3","tags":{"0":"quis justo maecenas rhoncus aliquam lacus morbi quis tortor id nulla ultrices aliquet maecenas leo odio"},"id":"0989920305","location":{"latitude":14.6701,"longitude":121.108226,"id":"PH","street_address":"967 Miller Parkway","name":"Nangka"},"category":"Teenage","title":"Promised Life, The (Vie promise, La)","description":"Other specified injury of extensor muscle, fascia and tendon of right thumb at wrist and hand level, initial encounter","created_datetime":"2019-03-28 11:47:48"},
// {"comments":{"count":73},"caption":{"created_time":"2:40 PM","text":"Reposition Abdominal Aorta, Percutaneous Endoscopic Approach","from":{"username":"kteers1","full_name":"Kinna Teers","type":"video/x-msvideo","id":"9367074271"},"id":"9800285229"},"likes":{"count":52},"link":"https://hubpages.com/amet/diam/in/magna/bibendum.png?luctus=turpis&ultricies=donec&eu=posuere&nibh=metus&quisque=vitae&id=ipsum&justo=aliquam&sit=non&amet=mauris&sapien=morbi&dignissim=non&vestibulum=lectus&vestibulum=aliquam&ante=sit&ipsum=amet&primis=diam&in=in&faucibus=magna&orci=bibendum&luctus=imperdiet&et=nullam&ultrices=orci&posuere=pede&cubilia=venenatis&curae=non&nulla=sodales&dapibus=sed&dolor=tincidunt&vel=eu&est=felis&donec=fusce&odio=posuere&justo=felis&sollicitudin=sed&ut=lacus&suscipit=morbi&a=sem&feugiat=mauris&et=laoreet&eros=ut&vestibulum=rhoncus&ac=aliquet&est=pulvinar&lacinia=sed&nisi=nisl&venenatis=nunc&tristique=rhoncus&fusce=dui&congue=vel&diam=sem&id=sed&ornare=sagittis&imperdiet=nam&sapien=congue&urna=risus&pretium=semper&nisl=porta&ut=volutpat&volutpat=quam&sapien=pede&arcu=lobortis&sed=ligula&augue=sit&aliquam=amet&erat=eleifend&volutpat=pede&in=libero&congue=quis&etiam=orci&justo=nullam&etiam=molestie&pretium=nibh&iaculis=in&justo=lectus&in=pellentesque&hac=at&habitasse=nulla&platea=suspendisse&dictumst=potenti&etiam=cras&faucibus=in&cursus=purus&urna=eu&ut=magna&tellus=vulputate&nulla=luctus&ut=cum&erat=sociis&id=natoque","user":{"username":"kteers1","profile_picture":"http://dummyimage.com/256x256.jpg/cc0000/ffffff","id":"3582899632"},"images":{"low_resolution":{"url":"http://dummyimage.com/512x512.bmp/cc0000/ffffff","width":512,"height":512},"thumbnail":{"url":"http://dummyimage.com/256x256.png/dddddd/000000","width":256,"height":256},"standard_resolution":{"url":"http://dummyimage.com/794x1024.jpg/5fa2dd/ffffff","width":1024,"height":1024}},"type":"video/avi","filter":"video/x-msvideo","tags":{"0":"magna at nunc commodo placerat praesent blandit nam nulla integer pede justo lacinia eget tincidunt eget tempus"},"id":"6839349160","location":{"latitude":7.8715342,"longitude":5.0728823,"id":"NG","street_address":"5 Waubesa Terrace","name":"Ipoti"},"category":"Parenting","title":"State Witness, The (Swiadek koronny)","description":"Nondisplaced other extraarticular fracture of unspecified calcaneus","created_datetime":"2019-07-31 19:14:10"},
// {"comments":{"count":21},"caption":{"created_time":"2:37 PM","text":"Release Left Hip Joint, Percutaneous Endoscopic Approach","from":{"username":"jheims2","full_name":"Jessalyn Heims","type":"audio/x-mpeg-3","id":"3658471085"},"id":"5630463950"},"likes":{"count":84},"link":"http://yahoo.co.jp/consequat.js?pede=enim&libero=sit&quis=amet&orci=nunc&nullam=viverra&molestie=dapibus&nibh=nulla&in=suscipit&lectus=ligula&pellentesque=in&at=lacus&nulla=curabitur&suspendisse=at&potenti=ipsum&cras=ac&in=tellus&purus=semper&eu=interdum","user":{"username":"jheims2","profile_picture":"http://dummyimage.com/256x256.jpg/dddddd/000000","id":"5689607576"},"images":{"low_resolution":{"url":"http://dummyimage.com/512x512.jpg/5fa2dd/ffffff","width":512,"height":512},"thumbnail":{"url":"http://dummyimage.com/256x256.jpg/cc0000/ffffff","width":256,"height":256},"standard_resolution":{"url":"http://dummyimage.com/735x1024.bmp/ff4444/ffffff","width":1024,"height":1024}},"type":"audio/mpeg3","filter":"video/mpeg","tags":{"0":"eu est congue elementum in hac habitasse platea dictumst morbi vestibulum velit id pretium"},"id":"5531371608","location":{"latitude":56.854995,"longitude":26.2255149,"id":"LV","street_address":"66 Sauthoff Avenue","name":"Madona"},"category":"Adult","title":"Dark Floors","description":"Injury of right internal carotid artery, intracranial portion, not elsewhere classified with loss of consciousness greater than 24 hours without return to pre-existing conscious level with patient surviving, initial encounter","created_datetime":"2019-04-07 16:01:56"},
// {"comments":{"count":68},"caption":{"created_time":"11:35 PM","text":"Ultrasonography of Inferior Vena Cava","from":{"username":"trenahan3","full_name":"Teador Renahan","type":"video/avi","id":"2340255597"},"id":"1213824095"},"likes":{"count":22},"link":"https://bloglovin.com/vitae/nisl/aenean/lectus/pellentesque/eget/nunc.jsp?et=aliquam&magnis=augue&dis=quam&parturient=sollicitudin&montes=vitae&nascetur=consectetuer&ridiculus=eget&mus=rutrum&etiam=at&vel=lorem&augue=integer&vestibulum=tincidunt&rutrum=ante&rutrum=vel&neque=ipsum&aenean=praesent&auctor=blandit&gravida=lacinia&sem=erat&praesent=vestibulum&id=sed&massa=magna&id=at&nisl=nunc&venenatis=commodo&lacinia=placerat&aenean=praesent&sit=blandit&amet=nam&justo=nulla&morbi=integer&ut=pede&odio=justo&cras=lacinia&mi=eget&pede=tincidunt&malesuada=eget&in=tempus&imperdiet=vel&et=pede&commodo=morbi&vulputate=porttitor&justo=lorem&in=id&blandit=ligula&ultrices=suspendisse&enim=ornare&lorem=consequat&ipsum=lectus&dolor=in&sit=est&amet=risus&consectetuer=auctor&adipiscing=sed&elit=tristique&proin=in&interdum=tempus&mauris=sit&non=amet&ligula=sem&pellentesque=fusce&ultrices=consequat&phasellus=nulla&id=nisl&sapien=nunc&in=nisl&sapien=duis&iaculis=bibendum&congue=felis&vivamus=sed&metus=interdum&arcu=venenatis&adipiscing=turpis&molestie=enim&hendrerit=blandit&at=mi&vulputate=in&vitae=porttitor&nisl=pede&aenean=justo&lectus=eu&pellentesque=massa&eget=donec&nunc=dapibus&donec=duis&quis=at&orci=velit&eget=eu&orci=est&vehicula=congue&condimentum=elementum&curabitur=in&in=hac&libero=habitasse&ut=platea&massa=dictumst&volutpat=morbi&convallis=vestibulum&morbi=velit&odio=id","user":{"username":"trenahan3","profile_picture":"http://dummyimage.com/256x256.png/cc0000/ffffff","id":"4209053716"},"images":{"low_resolution":{"url":"http://dummyimage.com/512x512.png/5fa2dd/ffffff","width":512,"height":512},"thumbnail":{"url":"http://dummyimage.com/256x256.bmp/cc0000/ffffff","width":256,"height":256},"standard_resolution":{"url":"http://dummyimage.com/914x1024.png/ff4444/ffffff","width":1024,"height":1024}},"type":"video/avi","filter":"video/mpeg","tags":{"0":"nunc donec quis orci eget orci vehicula condimentum curabitur in libero ut massa volutpat convallis"},"id":"8512892161","location":{"latitude":23.156045,"longitude":112.896606,"id":"CN","street_address":"1303 Elgar Crossing","name":"Sanshui"},"category":"Adult","title":"Hurt","description":"Exposure to smoke in controlled fire, not in building or structure","created_datetime":"2020-02-24 22:05:35"},
// {"comments":{"count":57},"caption":{"created_time":"10:47 AM","text":"Removal of Drainage Device from Spinal Canal, External Approach","from":{"username":"ccowndley4","full_name":"Celestine Cowndley","type":"video/avi","id":"7929021254"},"id":"2658012438"},"likes":{"count":30},"link":"https://shinystat.com/sapien/arcu/sed.png?non=vel&interdum=enim&in=sit&ante=amet&vestibulum=nunc&ante=viverra&ipsum=dapibus&primis=nulla&in=suscipit&faucibus=ligula&orci=in&luctus=lacus&et=curabitur&ultrices=at&posuere=ipsum&cubilia=ac&curae=tellus&duis=semper&faucibus=interdum&accumsan=mauris&odio=ullamcorper&curabitur=purus&convallis=sit","user":{"username":"ccowndley4","profile_picture":"http://dummyimage.com/256x256.bmp/ff4444/ffffff","id":"6010807999"},"images":{"low_resolution":{"url":"http://dummyimage.com/512x512.bmp/cc0000/ffffff","width":512,"height":512},"thumbnail":{"url":"http://dummyimage.com/256x256.jpg/5fa2dd/ffffff","width":256,"height":256},"standard_resolution":{"url":"http://dummyimage.com/843x1024.png/5fa2dd/ffffff","width":1024,"height":1024}},"type":"video/x-msvideo","filter":"video/quicktime","tags":{"0":"cursus id turpis integer aliquet massa id lobortis convallis tortor"},"id":"4786399124","location":{"latitude":42.2064232,"longitude":42.3448676,"id":"GE","street_address":"87 Oxford Court","name":"K’ulashi"},"category":"Marriage","title":"Wolves","description":"Unspecified transfusion reaction, subsequent encounter","created_datetime":"2020-02-20 04:15:11"},
// {"comments":{"count":29},"caption":{"created_time":"1:28 AM","text":"Drainage of Sacrococcygeal Joint, Percutaneous Approach","from":{"username":"cjuhruke5","full_name":"Catarina Juhruke","type":"video/mpeg","id":"5643939088"},"id":"9044911341"},"likes":{"count":86},"link":"https://list-manage.com/at/lorem/integer/tincidunt/ante/vel/ipsum.html?et=vulputate&ultrices=elementum&posuere=nullam&cubilia=varius&curae=nulla&mauris=facilisi&viverra=cras&diam=non&vitae=velit&quam=nec&suspendisse=nisi&potenti=vulputate&nullam=nonummy&porttitor=maecenas&lacus=tincidunt&at=lacus&turpis=at&donec=velit&posuere=vivamus&metus=vel&vitae=nulla&ipsum=eget&aliquam=eros&non=elementum&mauris=pellentesque&morbi=quisque&non=porta&lectus=volutpat&aliquam=erat&sit=quisque&amet=erat&diam=eros&in=viverra&magna=eget&bibendum=congue&imperdiet=eget&nullam=semper&orci=rutrum&pede=nulla&venenatis=nunc&non=purus&sodales=phasellus&sed=in&tincidunt=felis&eu=donec&felis=semper&fusce=sapien&posuere=a&felis=libero&sed=nam&lacus=dui&morbi=proin&sem=leo&mauris=odio&laoreet=porttitor&ut=id&rhoncus=consequat&aliquet=in&pulvinar=consequat&sed=ut&nisl=nulla&nunc=sed&rhoncus=accumsan","user":{"username":"cjuhruke5","profile_picture":"http://dummyimage.com/256x256.jpg/5fa2dd/ffffff","id":"8849342950"},"images":{"low_resolution":{"url":"http://dummyimage.com/512x512.png/cc0000/ffffff","width":512,"height":512},"thumbnail":{"url":"http://dummyimage.com/256x256.bmp/ff4444/ffffff","width":256,"height":256},"standard_resolution":{"url":"http://dummyimage.com/804x1024.bmp/ff4444/ffffff","width":1024,"height":1024}},"type":"application/x-troff-msvideo","filter":"video/mpeg","tags":{"0":"massa volutpat convallis morbi odio odio elementum eu interdum eu"},"id":"0003654060","location":{"latitude":28.902295,"longitude":118.155176,"id":"CN","street_address":"469 Bunting Center","name":"Zihu"},"category":"Dark","title":"Cairo Station (a.k.a. Iron Gate, The) (Bab el hadid)","description":"Salter-Harris Type III physeal fracture of upper end of radius, right arm, subsequent encounter for fracture with nonunion","created_datetime":"2019-08-17 18:29:14"},
// {"comments":{"count":85},"caption":{"created_time":"6:44 PM","text":"Bypass Left Internal Iliac Artery to Bilateral External Iliac Arteries with Synthetic Substitute, Open Approach","from":{"username":"hmadge6","full_name":"Hayward Madge","type":"video/x-mpeg","id":"8001973557"},"id":"5950518039"},"likes":{"count":49},"link":"https://flickr.com/varius/ut/blandit/non/interdum/in/ante.js?adipiscing=erat&lorem=quisque&vitae=erat&mattis=eros&nibh=viverra&ligula=eget&nec=congue&sem=eget&duis=semper&aliquam=rutrum&convallis=nulla&nunc=nunc&proin=purus&at=phasellus&turpis=in&a=felis&pede=donec&posuere=semper&nonummy=sapien&integer=a&non=libero&velit=nam&donec=dui&diam=proin&neque=leo&vestibulum=odio&eget=porttitor&vulputate=id&ut=consequat&ultrices=in&vel=consequat&augue=ut&vestibulum=nulla&ante=sed&ipsum=accumsan&primis=felis&in=ut&faucibus=at&orci=dolor&luctus=quis&et=odio&ultrices=consequat&posuere=varius&cubilia=integer&curae=ac&donec=leo&pharetra=pellentesque&magna=ultrices&vestibulum=mattis&aliquet=odio&ultrices=donec&erat=vitae&tortor=nisi&sollicitudin=nam&mi=ultrices&sit=libero&amet=non&lobortis=mattis&sapien=pulvinar&sapien=nulla&non=pede&mi=ullamcorper&integer=augue&ac=a&neque=suscipit&duis=nulla&bibendum=elit&morbi=ac&non=nulla&quam=sed&nec=vel&dui=enim&luctus=sit&rutrum=amet&nulla=nunc&tellus=viverra&in=dapibus&sagittis=nulla&dui=suscipit&vel=ligula&nisl=in&duis=lacus&ac=curabitur","user":{"username":"hmadge6","profile_picture":"http://dummyimage.com/256x256.jpg/5fa2dd/ffffff","id":"1544371217"},"images":{"low_resolution":{"url":"http://dummyimage.com/512x512.png/cc0000/ffffff","width":512,"height":512},"thumbnail":{"url":"http://dummyimage.com/256x256.bmp/dddddd/000000","width":256,"height":256},"standard_resolution":{"url":"http://dummyimage.com/746x1024.jpg/dddddd/000000","width":1024,"height":1024}},"type":"video/x-mpeg","filter":"video/x-mpeg","tags":{"0":"ultrices mattis odio donec vitae nisi nam ultrices libero non mattis pulvinar nulla pede ullamcorper"},"id":"6798725597","location":{"latitude":-5.5844754,"longitude":105.4771084,"id":"ID","street_address":"5 Riverside Point","name":"Sidomulyo"},"category":"Kids","title":"Me and Orson Welles","description":"Poisoning by other parasympatholytics [anticholinergics and antimuscarinics] and spasmolytics, intentional self-harm, initial encounter","created_datetime":"2019-05-30 03:56:26"},
// {"comments":{"count":64},"caption":{"created_time":"7:09 AM","text":"Removal of Drainage Device from Lower Intestinal Tract, Via Natural or Artificial Opening Endoscopic","from":{"username":"jwigin7","full_name":"Jared Wigin","type":"video/x-msvideo","id":"5051137350"},"id":"1136309470"},"likes":{"count":39},"link":"https://wiley.com/dolor/quis/odio/consequat/varius/integer.xml?ipsum=velit&primis=donec&in=diam&faucibus=neque&orci=vestibulum&luctus=eget&et=vulputate&ultrices=ut&posuere=ultrices&cubilia=vel&curae=augue&donec=vestibulum&pharetra=ante&magna=ipsum&vestibulum=primis&aliquet=in&ultrices=faucibus&erat=orci&tortor=luctus&sollicitudin=et&mi=ultrices&sit=posuere&amet=cubilia&lobortis=curae&sapien=donec&sapien=pharetra&non=magna","user":{"username":"jwigin7","profile_picture":"http://dummyimage.com/256x256.jpg/5fa2dd/ffffff","id":"8537643912"},"images":{"low_resolution":{"url":"http://dummyimage.com/512x512.bmp/ff4444/ffffff","width":512,"height":512},"thumbnail":{"url":"http://dummyimage.com/256x256.png/cc0000/ffffff","width":256,"height":256},"standard_resolution":{"url":"http://dummyimage.com/899x1024.png/cc0000/ffffff","width":1024,"height":1024}},"type":"video/avi","filter":"video/mpeg","tags":{"0":"duis ac nibh fusce lacus purus aliquet at feugiat non"},"id":"9087774605","location":{"latitude":39.9459413,"longitude":116.3817634,"id":"CN","street_address":"76 Warrior Drive","name":"Xiaochi"},"category":"Marriage","title":"Ladykillers, The","description":"Motorcycle passenger injured in collision with other nonmotor vehicle in traffic accident","created_datetime":"2020-01-10 10:32:39"},
// {"comments":{"count":58},"caption":{"created_time":"9:09 PM","text":"Excision of Middle Colic Artery, Open Approach","from":{"username":"anorledge8","full_name":"Amargo Norledge","type":"video/avi","id":"2833702612"},"id":"4337179534"},"likes":{"count":10},"link":"http://istockphoto.com/dictumst/etiam/faucibus/cursus/urna/ut/tellus.jpg?ut=auctor&suscipit=sed&a=tristique&feugiat=in&et=tempus&eros=sit&vestibulum=amet&ac=sem&est=fusce&lacinia=consequat&nisi=nulla&venenatis=nisl&tristique=nunc&fusce=nisl&congue=duis&diam=bibendum&id=felis&ornare=sed&imperdiet=interdum&sapien=venenatis&urna=turpis&pretium=enim&nisl=blandit&ut=mi&volutpat=in&sapien=porttitor&arcu=pede&sed=justo&augue=eu&aliquam=massa&erat=donec&volutpat=dapibus&in=duis&congue=at&etiam=velit&justo=eu&etiam=est&pretium=congue&iaculis=elementum&justo=in&in=hac&hac=habitasse&habitasse=platea&platea=dictumst&dictumst=morbi&etiam=vestibulum&faucibus=velit&cursus=id&urna=pretium&ut=iaculis&tellus=diam&nulla=erat&ut=fermentum","user":{"username":"anorledge8","profile_picture":"http://dummyimage.com/256x256.bmp/cc0000/ffffff","id":"4948083097"},"images":{"low_resolution":{"url":"http://dummyimage.com/512x512.bmp/5fa2dd/ffffff","width":512,"height":512},"thumbnail":{"url":"http://dummyimage.com/256x256.bmp/dddddd/000000","width":256,"height":256},"standard_resolution":{"url":"http://dummyimage.com/724x1024.png/cc0000/ffffff","width":1024,"height":1024}},"type":"video/mpeg","filter":"video/mpeg","tags":{"0":"primis in faucibus orci luctus et ultrices posuere cubilia curae donec pharetra magna"},"id":"2113559803","location":{"latitude":-7.002985,"longitude":112.282503,"id":"ID","street_address":"5019 Clyde Gallagher Hill","name":"Jangkungkusumo"},"category":"Dark","title":"Eye for an Eye, An","description":"Activity, ice hockey","created_datetime":"2019-07-14 19:21:39"},
// {"comments":{"count":36},"caption":{"created_time":"12:41 PM","text":"Bypass Abdominal Aorta to Left Internal Iliac Artery with Autologous Arterial Tissue, Open Approach","from":{"username":"cwightman9","full_name":"Catherin Wightman","type":"video/x-msvideo","id":"4864818401"},"id":"0065004477"},"likes":{"count":55},"link":"https://marketwatch.com/ut/rhoncus.jsp?justo=id&aliquam=massa&quis=id&turpis=nisl&eget=venenatis&elit=lacinia&sodales=aenean&scelerisque=sit&mauris=amet&sit=justo&amet=morbi&eros=ut&suspendisse=odio&accumsan=cras&tortor=mi&quis=pede&turpis=malesuada&sed=in&ante=imperdiet&vivamus=et&tortor=commodo&duis=vulputate&mattis=justo&egestas=in&metus=blandit&aenean=ultrices&fermentum=enim&donec=lorem&ut=ipsum&mauris=dolor&eget=sit&massa=amet&tempor=consectetuer&convallis=adipiscing&nulla=elit&neque=proin&libero=interdum&convallis=mauris&eget=non&eleifend=ligula&luctus=pellentesque&ultricies=ultrices&eu=phasellus&nibh=id&quisque=sapien&id=in&justo=sapien&sit=iaculis&amet=congue","user":{"username":"cwightman9","profile_picture":"http://dummyimage.com/256x256.bmp/ff4444/ffffff","id":"9699724102"},"images":{"low_resolution":{"url":"http://dummyimage.com/512x512.bmp/dddddd/000000","width":512,"height":512},"thumbnail":{"url":"http://dummyimage.com/256x256.bmp/5fa2dd/ffffff","width":256,"height":256},"standard_resolution":{"url":"http://dummyimage.com/986x1024.bmp/ff4444/ffffff","width":1024,"height":1024}},"type":"audio/mpeg3","filter":"video/avi","tags":{"0":"sapien cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus etiam vel augue"},"id":"8855648683","location":{"latitude":39.9378208,"longitude":116.4103205,"id":"CN","street_address":"44587 Esker Lane","name":"Dagui"},"category":"Adult","title":"Nazis: A Warning from History, The","description":"Toxic effect of contact with other venomous plant, intentional self-harm, subsequent encounter","created_datetime":"2020-01-23 22:13:10"},
// {"comments":{"count":12},"caption":{"created_time":"12:51 PM","text":"Replacement of Greater Omentum with Synthetic Substitute, Open Approach","from":{"username":"vlatteya","full_name":"Vanda Lattey","type":"video/mpeg","id":"3453438639"},"id":"3665182794"},"likes":{"count":54},"link":"https://is.gd/venenatis/lacinia/aenean/sit/amet/justo.xml?nullam=vel&varius=accumsan&nulla=tellus&facilisi=nisi&cras=eu&non=orci&velit=mauris&nec=lacinia&nisi=sapien&vulputate=quis&nonummy=libero&maecenas=nullam&tincidunt=sit&lacus=amet&at=turpis&velit=elementum&vivamus=ligula&vel=vehicula&nulla=consequat&eget=morbi&eros=a&elementum=ipsum&pellentesque=integer&quisque=a&porta=nibh&volutpat=in&erat=quis&quisque=justo&erat=maecenas&eros=rhoncus&viverra=aliquam&eget=lacus&congue=morbi&eget=quis&semper=tortor&rutrum=id&nulla=nulla&nunc=ultrices&purus=aliquet&phasellus=maecenas&in=leo&felis=odio&donec=condimentum&semper=id&sapien=luctus&a=nec&libero=molestie&nam=sed&dui=justo&proin=pellentesque&leo=viverra&odio=pede&porttitor=ac&id=diam&consequat=cras&in=pellentesque&consequat=volutpat&ut=dui&nulla=maecenas&sed=tristique&accumsan=est&felis=et&ut=tempus&at=semper&dolor=est&quis=quam&odio=pharetra&consequat=magna&varius=ac&integer=consequat&ac=metus&leo=sapien&pellentesque=ut&ultrices=nunc&mattis=vestibulum&odio=ante&donec=ipsum&vitae=primis&nisi=in&nam=faucibus&ultrices=orci&libero=luctus&non=et","user":{"username":"vlatteya","profile_picture":"http://dummyimage.com/256x256.jpg/5fa2dd/ffffff","id":"2961112052"},"images":{"low_resolution":{"url":"http://dummyimage.com/512x512.png/5fa2dd/ffffff","width":512,"height":512},"thumbnail":{"url":"http://dummyimage.com/256x256.bmp/cc0000/ffffff","width":256,"height":256},"standard_resolution":{"url":"http://dummyimage.com/722x1024.jpg/ff4444/ffffff","width":1024,"height":1024}},"type":"video/x-msvideo","filter":"video/mpeg","tags":{"0":"pede ullamcorper augue a suscipit nulla elit ac nulla sed vel enim sit amet nunc viverra dapibus nulla"},"id":"1793742693","location":{"latitude":40.7681987,"longitude":-73.9608428,"id":"US","street_address":"0 Esker Center","name":"New York City"},"category":"Education","title":"Blackout","description":"Keratomalacia, bilateral","created_datetime":"2019-04-13 23:30:36"},
// {"comments":{"count":73},"caption":{"created_time":"7:16 AM","text":"Resection of Right Shoulder Bursa and Ligament, Open Approach","from":{"username":"bfasseb","full_name":"Bengt Fasse","type":"application/x-troff-msvideo","id":"2982973111"},"id":"5681892980"},"likes":{"count":42},"link":"https://omniture.com/nibh/ligula/nec/sem/duis/aliquam.jpg?adipiscing=nulla&elit=integer&proin=pede&interdum=justo&mauris=lacinia&non=eget&ligula=tincidunt&pellentesque=eget&ultrices=tempus&phasellus=vel&id=pede&sapien=morbi&in=porttitor&sapien=lorem&iaculis=id&congue=ligula&vivamus=suspendisse&metus=ornare&arcu=consequat&adipiscing=lectus&molestie=in&hendrerit=est&at=risus&vulputate=auctor&vitae=sed&nisl=tristique&aenean=in&lectus=tempus&pellentesque=sit&eget=amet&nunc=sem&donec=fusce&quis=consequat&orci=nulla&eget=nisl&orci=nunc&vehicula=nisl&condimentum=duis&curabitur=bibendum&in=felis&libero=sed&ut=interdum&massa=venenatis&volutpat=turpis&convallis=enim&morbi=blandit&odio=mi&odio=in&elementum=porttitor&eu=pede&interdum=justo&eu=eu&tincidunt=massa&in=donec&leo=dapibus&maecenas=duis&pulvinar=at&lobortis=velit&est=eu&phasellus=est&sit=congue&amet=elementum&erat=in&nulla=hac&tempus=habitasse&vivamus=platea&in=dictumst&felis=morbi&eu=vestibulum&sapien=velit&cursus=id&vestibulum=pretium&proin=iaculis&eu=diam&mi=erat&nulla=fermentum&ac=justo&enim=nec&in=condimentum&tempor=neque&turpis=sapien&nec=placerat&euismod=ante&scelerisque=nulla&quam=justo&turpis=aliquam&adipiscing=quis&lorem=turpis&vitae=eget&mattis=elit&nibh=sodales&ligula=scelerisque&nec=mauris&sem=sit","user":{"username":"bfasseb","profile_picture":"http://dummyimage.com/256x256.bmp/cc0000/ffffff","id":"2926817452"},"images":{"low_resolution":{"url":"http://dummyimage.com/512x512.bmp/dddddd/000000","width":512,"height":512},"thumbnail":{"url":"http://dummyimage.com/256x256.jpg/ff4444/ffffff","width":256,"height":256},"standard_resolution":{"url":"http://dummyimage.com/878x1024.bmp/5fa2dd/ffffff","width":1024,"height":1024}},"type":"video/mpeg","filter":"video/mpeg","tags":{"0":"morbi non lectus aliquam sit amet diam in magna bibendum imperdiet nullam orci pede"},"id":"5519492158","location":{"latitude":51.9701203,"longitude":5.9409472,"id":"NL","street_address":"1061 Ruskin Crossing","name":"Arnhem"},"category":"Grand","title":"Broken Windows","description":"Other reduction defects of left upper limb","created_datetime":"2019-09-20 21:44:19"},
// {"comments":{"count":8},"caption":{"created_time":"2:49 AM","text":"Supplement Left External Iliac Vein with Autologous Tissue Substitute, Percutaneous Endoscopic Approach","from":{"username":"ihatherleyc","full_name":"Issy Hatherley","type":"video/x-msvideo","id":"2186625458"},"id":"7079755298"},"likes":{"count":99},"link":"http://indiatimes.com/suscipit/ligula/in/lacus/curabitur/at/ipsum.xml?integer=ac&tincidunt=nibh&ante=fusce&vel=lacus&ipsum=purus&praesent=aliquet&blandit=at&lacinia=feugiat&erat=non&vestibulum=pretium&sed=quis","user":{"username":"ihatherleyc","profile_picture":"http://dummyimage.com/256x256.bmp/ff4444/ffffff","id":"9395477288"},"images":{"low_resolution":{"url":"http://dummyimage.com/512x512.jpg/cc0000/ffffff","width":512,"height":512},"thumbnail":{"url":"http://dummyimage.com/256x256.jpg/ff4444/ffffff","width":256,"height":256},"standard_resolution":{"url":"http://dummyimage.com/919x1024.bmp/cc0000/ffffff","width":1024,"height":1024}},"type":"video/mpeg","filter":"video/mpeg","tags":{"0":"ultrices posuere cubilia curae mauris viverra diam vitae quam suspendisse potenti nullam porttitor lacus at turpis donec posuere metus"},"id":"1283559714","location":{"latitude":5.0281872,"longitude":118.3157161,"id":"MY","street_address":"0838 Hoepker Pass","name":"Lahad Datu"},"category":"Marriage","title":"Children of Leningradsky, The","description":"Immersion hand, left hand, sequela","created_datetime":"2019-04-05 09:00:02"},
// {"comments":{"count":97},"caption":{"created_time":"5:14 AM","text":"Inspection of Lumbosacral Disc, Percutaneous Approach","from":{"username":"opashleyd","full_name":"Obidiah Pashley","type":"video/mpeg","id":"2539066240"},"id":"3724728433"},"likes":{"count":50},"link":"http://last.fm/cubilia.aspx?ante=sed&nulla=sagittis&justo=nam&aliquam=congue&quis=risus&turpis=semper&eget=porta&elit=volutpat&sodales=quam&scelerisque=pede&mauris=lobortis&sit=ligula&amet=sit&eros=amet&suspendisse=eleifend&accumsan=pede&tortor=libero&quis=quis&turpis=orci&sed=nullam&ante=molestie&vivamus=nibh&tortor=in&duis=lectus&mattis=pellentesque&egestas=at","user":{"username":"opashleyd","profile_picture":"http://dummyimage.com/256x256.jpg/cc0000/ffffff","id":"6022942632"},"images":{"low_resolution":{"url":"http://dummyimage.com/512x512.png/cc0000/ffffff","width":512,"height":512},"thumbnail":{"url":"http://dummyimage.com/256x256.bmp/ff4444/ffffff","width":256,"height":256},"standard_resolution":{"url":"http://dummyimage.com/1015x1024.png/cc0000/ffffff","width":1024,"height":1024}},"type":"video/mpeg","filter":"video/msvideo","tags":{"0":"augue vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae donec"},"id":"2685067906","location":{"latitude":39.672791,"longitude":113.732809,"id":"CN","street_address":"0678 Bowman Place","name":"Hengshan"},"category":"Grand","title":"Reasonable Doubt","description":"Contusion of right breast, sequela","created_datetime":"2019-11-19 15:53:41"},
// {"comments":{"count":100},"caption":{"created_time":"1:13 AM","text":"Repair Left Adrenal Gland, Percutaneous Approach","from":{"username":"bdrinkele","full_name":"Bernard Drinkel","type":"video/quicktime","id":"3239545195"},"id":"5590289130"},"likes":{"count":100},"link":"http://oaic.gov.au/in/hac/habitasse/platea/dictumst/maecenas.jpg?at=pulvinar&vulputate=lobortis&vitae=est&nisl=phasellus&aenean=sit&lectus=amet&pellentesque=erat&eget=nulla&nunc=tempus&donec=vivamus&quis=in&orci=felis&eget=eu&orci=sapien&vehicula=cursus","user":{"username":"bdrinkele","profile_picture":"http://dummyimage.com/256x256.jpg/dddddd/000000","id":"3722219914"},"images":{"low_resolution":{"url":"http://dummyimage.com/512x512.bmp/dddddd/000000","width":512,"height":512},"thumbnail":{"url":"http://dummyimage.com/256x256.jpg/dddddd/000000","width":256,"height":256},"standard_resolution":{"url":"http://dummyimage.com/800x1024.jpg/5fa2dd/ffffff","width":1024,"height":1024}},"type":"video/msvideo","filter":"audio/x-mpeg-3","tags":{"0":"feugiat et eros vestibulum ac est lacinia nisi venenatis tristique fusce congue diam id ornare"},"id":"4595464746","location":{"latitude":59.4388399,"longitude":5.3184101,"id":"NO","street_address":"5 Hudson Plaza","name":"Haugesund"},"category":"Teenage","title":"Godzilla vs. Mechagodzilla II (Gojira VS Mekagojira)","description":"Traumatic cerebral edema with loss of consciousness greater than 24 hours with return to pre-existing conscious level, sequela","created_datetime":"2019-08-24 10:00:32"},
// {"comments":{"count":6},"caption":{"created_time":"5:59 AM","text":"Supplement Right Ethmoid Bone with Autologous Tissue Substitute, Percutaneous Approach","from":{"username":"kduligallf","full_name":"Kaila Duligall","type":"application/x-troff-msvideo","id":"9305633978"},"id":"8116884786"},"likes":{"count":33},"link":"https://naver.com/accumsan/felis/ut/at/dolor.html?nisl=odio&venenatis=odio&lacinia=elementum&aenean=eu&sit=interdum&amet=eu&justo=tincidunt&morbi=in&ut=leo&odio=maecenas&cras=pulvinar&mi=lobortis&pede=est&malesuada=phasellus&in=sit&imperdiet=amet&et=erat&commodo=nulla&vulputate=tempus&justo=vivamus&in=in&blandit=felis&ultrices=eu&enim=sapien&lorem=cursus&ipsum=vestibulum&dolor=proin&sit=eu&amet=mi&consectetuer=nulla&adipiscing=ac&elit=enim&proin=in&interdum=tempor&mauris=turpis&non=nec&ligula=euismod&pellentesque=scelerisque&ultrices=quam&phasellus=turpis&id=adipiscing&sapien=lorem&in=vitae&sapien=mattis&iaculis=nibh&congue=ligula&vivamus=nec&metus=sem&arcu=duis&adipiscing=aliquam&molestie=convallis&hendrerit=nunc&at=proin&vulputate=at&vitae=turpis&nisl=a&aenean=pede&lectus=posuere&pellentesque=nonummy&eget=integer&nunc=non&donec=velit&quis=donec","user":{"username":"kduligallf","profile_picture":"http://dummyimage.com/256x256.jpg/dddddd/000000","id":"3564109390"},"images":{"low_resolution":{"url":"http://dummyimage.com/512x512.bmp/ff4444/ffffff","width":512,"height":512},"thumbnail":{"url":"http://dummyimage.com/256x256.jpg/dddddd/000000","width":256,"height":256},"standard_resolution":{"url":"http://dummyimage.com/799x1024.bmp/ff4444/ffffff","width":1024,"height":1024}},"type":"video/mpeg","filter":"audio/x-mpeg-3","tags":{"0":"turpis integer aliquet massa id lobortis convallis tortor risus dapibus augue vel"},"id":"5441937041","location":{"latitude":-6.7354694,"longitude":105.8429054,"id":"ID","street_address":"0 Hayes Terrace","name":"Benger"},"category":"Grand","title":"Nick the Sting","description":"Erythema nodosum","created_datetime":"2019-11-08 20:00:25"},
// {"comments":{"count":19},"caption":{"created_time":"3:37 PM","text":"Removal of Autologous Tissue Substitute from Pancreatic Duct, Percutaneous Endoscopic Approach","from":{"username":"ibedrosiang","full_name":"Isadore Bedrosian","type":"video/avi","id":"0300041438"},"id":"7004338819"},"likes":{"count":28},"link":"http://bloglines.com/in/purus/eu/magna/vulputate/luctus/cum.js?ligula=consectetuer&nec=adipiscing&sem=elit&duis=proin&aliquam=risus&convallis=praesent&nunc=lectus&proin=vestibulum&at=quam&turpis=sapien&a=varius&pede=ut&posuere=blandit&nonummy=non&integer=interdum&non=in&velit=ante&donec=vestibulum&diam=ante&neque=ipsum&vestibulum=primis&eget=in&vulputate=faucibus&ut=orci&ultrices=luctus&vel=et&augue=ultrices&vestibulum=posuere&ante=cubilia&ipsum=curae&primis=duis&in=faucibus&faucibus=accumsan&orci=odio&luctus=curabitur&et=convallis&ultrices=duis&posuere=consequat&cubilia=dui&curae=nec&donec=nisi&pharetra=volutpat","user":{"username":"ibedrosiang","profile_picture":"http://dummyimage.com/256x256.jpg/cc0000/ffffff","id":"0102223750"},"images":{"low_resolution":{"url":"http://dummyimage.com/512x512.bmp/5fa2dd/ffffff","width":512,"height":512},"thumbnail":{"url":"http://dummyimage.com/256x256.jpg/cc0000/ffffff","width":256,"height":256},"standard_resolution":{"url":"http://dummyimage.com/750x1024.bmp/dddddd/000000","width":1024,"height":1024}},"type":"audio/x-mpeg-3","filter":"video/quicktime","tags":{"0":"auctor gravida sem praesent id massa id nisl venenatis lacinia"},"id":"2024516580","location":{"latitude":34.273409,"longitude":109.064671,"id":"CN","street_address":"196 Bowman Drive","name":"Baqiao"},"category":"Parenting","title":"G.I. Joe: The Rise of Cobra","description":"Other specified injury of femoral artery, right leg","created_datetime":"2019-09-07 13:22:01"},
// {"comments":{"count":72},"caption":{"created_time":"12:32 AM","text":"Reposition Right Ureter, Percutaneous Endoscopic Approach","from":{"username":"mdeansh","full_name":"Melany Deans","type":"video/x-mpeg","id":"0735724741"},"id":"0040582779"},"likes":{"count":39},"link":"https://discovery.com/sit/amet/eleifend/pede.json?at=vel&velit=pede&vivamus=morbi&vel=porttitor&nulla=lorem&eget=id&eros=ligula&elementum=suspendisse&pellentesque=ornare&quisque=consequat&porta=lectus&volutpat=in&erat=est&quisque=risus&erat=auctor&eros=sed&viverra=tristique","user":{"username":"mdeansh","profile_picture":"http://dummyimage.com/256x256.bmp/5fa2dd/ffffff","id":"7782627990"},"images":{"low_resolution":{"url":"http://dummyimage.com/512x512.bmp/cc0000/ffffff","width":512,"height":512},"thumbnail":{"url":"http://dummyimage.com/256x256.jpg/dddddd/000000","width":256,"height":256},"standard_resolution":{"url":"http://dummyimage.com/1023x1024.bmp/cc0000/ffffff","width":1024,"height":1024}},"type":"video/quicktime","filter":"video/msvideo","tags":{"0":"hendrerit at vulputate vitae nisl aenean lectus pellentesque eget nunc"},"id":"3134924145","location":{"latitude":18.4395252,"longitude":-73.0862735,"id":"HT","street_address":"904 Brown Place","name":"Miragoâne"},"category":"Teenage","title":"Towering Inferno, The","description":"Poisoning by therapeutic gases, undetermined, sequela","created_datetime":"2019-04-02 07:57:45"},
// {"comments":{"count":54},"caption":{"created_time":"2:00 AM","text":"Removal of Monitoring Device from Hepatobiliary Duct, Percutaneous Endoscopic Approach","from":{"username":"mmacgianyi","full_name":"Maud MacGiany","type":"application/x-troff-msvideo","id":"5371095993"},"id":"4294871075"},"likes":{"count":46},"link":"http://sphinn.com/mi.png?volutpat=non&erat=sodales&quisque=sed&erat=tincidunt&eros=eu&viverra=felis&eget=fusce&congue=posuere&eget=felis&semper=sed&rutrum=lacus&nulla=morbi&nunc=sem&purus=mauris&phasellus=laoreet&in=ut&felis=rhoncus&donec=aliquet&semper=pulvinar&sapien=sed&a=nisl&libero=nunc&nam=rhoncus&dui=dui&proin=vel&leo=sem&odio=sed&porttitor=sagittis&id=nam&consequat=congue&in=risus&consequat=semper&ut=porta&nulla=volutpat&sed=quam&accumsan=pede&felis=lobortis&ut=ligula&at=sit&dolor=amet&quis=eleifend&odio=pede&consequat=libero&varius=quis&integer=orci&ac=nullam&leo=molestie&pellentesque=nibh&ultrices=in&mattis=lectus&odio=pellentesque&donec=at&vitae=nulla&nisi=suspendisse&nam=potenti&ultrices=cras&libero=in&non=purus&mattis=eu&pulvinar=magna&nulla=vulputate&pede=luctus&ullamcorper=cum&augue=sociis&a=natoque&suscipit=penatibus&nulla=et&elit=magnis&ac=dis&nulla=parturient&sed=montes","user":{"username":"mmacgianyi","profile_picture":"http://dummyimage.com/256x256.png/cc0000/ffffff","id":"6428339463"},"images":{"low_resolution":{"url":"http://dummyimage.com/512x512.jpg/dddddd/000000","width":512,"height":512},"thumbnail":{"url":"http://dummyimage.com/256x256.jpg/ff4444/ffffff","width":256,"height":256},"standard_resolution":{"url":"http://dummyimage.com/919x1024.png/ff4444/ffffff","width":1024,"height":1024}},"type":"audio/x-mpeg-3","filter":"application/x-troff-msvideo","tags":{"0":"montes nascetur ridiculus mus etiam vel augue vestibulum rutrum rutrum neque aenean auctor gravida sem praesent id"},"id":"0530456206","location":{"latitude":12.0675239,"longitude":123.7223625,"id":"PH","street_address":"7 Pierstorff Junction","name":"Cawayan"},"category":"Marriage","title":"Angst","description":"Other displaced fracture of lower end of left humerus","created_datetime":"2019-10-30 03:55:23"},
// {"comments":{"count":38},"caption":{"created_time":"4:37 AM","text":"Revision of External Fixation Device in Left Hip Joint, Percutaneous Endoscopic Approach","from":{"username":"tgartsidej","full_name":"Tuck Gartside","type":"video/msvideo","id":"4507583527"},"id":"1200287770"},"likes":{"count":46},"link":"https://nsw.gov.au/suspendisse/potenti.png?diam=curae&id=nulla&ornare=dapibus&imperdiet=dolor&sapien=vel","user":{"username":"tgartsidej","profile_picture":"http://dummyimage.com/256x256.jpg/cc0000/ffffff","id":"5642983296"},"images":{"low_resolution":{"url":"http://dummyimage.com/512x512.bmp/ff4444/ffffff","width":512,"height":512},"thumbnail":{"url":"http://dummyimage.com/256x256.bmp/dddddd/000000","width":256,"height":256},"standard_resolution":{"url":"http://dummyimage.com/855x1024.png/5fa2dd/ffffff","width":1024,"height":1024}},"type":"video/mpeg","filter":"video/quicktime","tags":{"0":"pellentesque viverra pede ac diam cras pellentesque volutpat dui maecenas tristique est et"},"id":"2572234750","location":{"latitude":59.5085196,"longitude":18.0551581,"id":"SE","street_address":"4933 Harbort Terrace","name":"Vallentuna"},"category":"Parenting","title":"To Die For","description":"Pathological fracture, left ankle, subsequent encounter for fracture with nonunion","created_datetime":"2019-06-17 02:44:39"}];

	public users:any = [
											{"id":"6274150811","username":"bhatherell0","full_name":"Brynne Hatherell","profile_picture":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAGWSURBVBgZpcE/a1NhGMbh3/OeN56cKq2Dp6AoCOKmk4uCn8DNycEOIojilr2TaBfRzVnESQR3Bz+FFDoWA2IjtkRqmpyc97k9qYl/IQV7XSaJw4g0VlZfP0m13dwepPbuiH85fyhyWCx4/ubxjU6kkdxWHt69VC6XpZlFBAhwJgwJJHAmRKorbj94ewvoRBrbuykvT5R2/+lLTp05Tp45STmEJYJBMAjByILxYeM9jzr3GCczGpHGYAQhRM6fO8uFy1fJQoaUwCKYEcwwC4QQaGUBd36KTDmQ523axTGQmEcIEBORKQfG1ZDxcA/MkBxXwj1ggCQyS9TVAMmZiUxJ8Ln/kS+9PmOvcSW+jrao0mmMH5bzHfa+9UGBmciUBJ+2Fmh1h+yTQCXSkJkdCrpd8btIwwEJQnaEkOXMk7XaiF8CUxL/JdKQOwb0Ntc5SG9zHXQNd/ZFGsaEeLa2ChjzXQcqZiKNxSL0vR4unVwwMENMCATib0ZdV+QtE41I42geXt1Ze3dlMNZFdw6Ut6CIvKBhkjiM79Pyq1YUmtkKAAAAAElFTkSuQmCC","bio":"Oth injury of left internal jugular vein, sequela","website":"https://t-online.de/et/tempus/semper/est/quam/pharetra/magna.js?faucibus=pede&orci=lobortis&luctus=ligula&et=sit&ultrices=amet&posuere=eleifend&cubilia=pede&curae=libero&donec=quis&pharetra=orci&magna=nullam&vestibulum=molestie&aliquet=nibh&ultrices=in&erat=lectus&tortor=pellentesque&sollicitudin=at&mi=nulla&sit=suspendisse&amet=potenti&lobortis=cras&sapien=in&sapien=purus&non=eu&mi=magna&integer=vulputate&ac=luctus&neque=cum&duis=sociis&bibendum=natoque&morbi=penatibus&non=et&quam=magnis&nec=dis&dui=parturient&luctus=montes&rutrum=nascetur&nulla=ridiculus&tellus=mus&in=vivamus&sagittis=vestibulum&dui=sagittis&vel=sapien&nisl=cum&duis=sociis&ac=natoque&nibh=penatibus&fusce=et&lacus=magnis&purus=dis&aliquet=parturient&at=montes&feugiat=nascetur&non=ridiculus&pretium=mus&quis=etiam&lectus=vel&suspendisse=augue&potenti=vestibulum&in=rutrum&eleifend=rutrum&quam=neque&a=aenean&odio=auctor&in=gravida&hac=sem&habitasse=praesent&platea=id&dictumst=massa&maecenas=id&ut=nisl&massa=venenatis&quis=lacinia&augue=aenean","is_business":false,"counts":{"media":290,"follows":572,"followed_by":450}},
											{"id":"5250574017","username":"aletessier1","full_name":"Adaline Letessier","profile_picture":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAIOSURBVDjLpZM7aFRhEIW/m73r5gWB9UFEzAMsjIIIgkViFzFgJbHR0kqI2Ahi7KzsrEWwCQZsBFFIExWCqJWKClppEDTxEVCym73/a/75LW7AFIksOOXA+eacA5OllPifyTdbTt9dSVEVLxCj4kVxosxM7c3aAjivHNvfjaiiCSQmHrxstO/ABMVHZWVVCDHR11VhzWj7gJYRvCg2KBITLu+gaWRzQLp6uWxRlRSEFIRi+ArOJ2xIBFE6q5GGjf9wMH4cVMliJIuR5lvFScK4SIjQVU00toqQgpCJwOtXIAEOHWbNeGxQCl9GsNsyxIQtAM6XAGchCARh1SVcUIxTQkz01hRtKRefnEvBC94Hgg04F8jVOjpEwDoIAbxnraVYnzBe8bHs4pTc4/TMU+LyF6Rex41OcLv2jVzN+mXnwHsQQUwoHawD9n28w9jgAgfGL1AbPoh5N8+HZ48ZwdChhS2FxoC1EALaUqwvAcYre97fYmR8ks5PC2QzZ+levM/QQJ0jn7+Sp8LAxggiqFHMBgd9zSU6+4fh5KW/5V3bTb0I5FqYUjg6BjGCCMkIXhL9fVVEodGzi+LNHD0Pp3DmOwXQbFT4XcvJb9ROoLM/SU5IIZJCRHsjc7PL4JUUhZ3bJ+l/Mc/Qji7ySpXmirD4o4NH7ihZu+/8/MzAdOvX8vlKzAZjJS0luDkxL9f/ALqCe8YKiajkAAAAAElFTkSuQmCC","bio":"Laceration of unsp part of small intestine, subs encntr","website":"https://sourceforge.net/vehicula/condimentum.xml?vulputate=duis&vitae=bibendum&nisl=felis&aenean=sed&lectus=interdum&pellentesque=venenatis&eget=turpis&nunc=enim&donec=blandit&quis=mi&orci=in&eget=porttitor&orci=pede&vehicula=justo&condimentum=eu&curabitur=massa&in=donec&libero=dapibus&ut=duis&massa=at&volutpat=velit&convallis=eu&morbi=est&odio=congue&odio=elementum&elementum=in&eu=hac&interdum=habitasse&eu=platea&tincidunt=dictumst&in=morbi&leo=vestibulum&maecenas=velit&pulvinar=id&lobortis=pretium&est=iaculis&phasellus=diam&sit=erat&amet=fermentum&erat=justo&nulla=nec&tempus=condimentum&vivamus=neque&in=sapien&felis=placerat&eu=ante&sapien=nulla&cursus=justo&vestibulum=aliquam&proin=quis&eu=turpis&mi=eget&nulla=elit&ac=sodales&enim=scelerisque&in=mauris&tempor=sit&turpis=amet&nec=eros&euismod=suspendisse&scelerisque=accumsan&quam=tortor&turpis=quis&adipiscing=turpis&lorem=sed&vitae=ante&mattis=vivamus&nibh=tortor&ligula=duis&nec=mattis&sem=egestas&duis=metus&aliquam=aenean&convallis=fermentum&nunc=donec&proin=ut&at=mauris&turpis=eget&a=massa&pede=tempor&posuere=convallis&nonummy=nulla&integer=neque&non=libero&velit=convallis&donec=eget&diam=eleifend&neque=luctus&vestibulum=ultricies","is_business":true,"counts":{"media":784,"follows":650,"followed_by":422}},
											{"id":"1092860150","username":"kbampton2","full_name":"Kristoffer Bampton","profile_picture":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAHySURBVDjLtZPvT1JxFMb5O/gHskVzrrV+mFZomDdEDGkYKSXlRleY6IzcFdQ7lBgYeaELBNjFEpbWi9psRU7JnCa3VYTV/WfY01davkFk0/XivDp7Ps/Zc86RAZAdpmT/BWDLmun+5ZuS5X0P+paMML82SKZXeroqYGDttty22it6Po8iWeCxIAlI/5pF9Osj3M8MwPCsXex8ekVeEWAlYn+OxaKUxNx2FKmfcTzfjiH2ncNsnsfIOzu00RZxT4B1pZee3GTw4vdfVyEfxkTWAdfyMMJfHiL2LYgImcSyeAstgQt0GeBuxiQl8iEIP/iSW/eCrtiV0rLXkm3s1ThVnN6cQkj0w511osl7TioD9L29QcaNY64QhWvlHrrmtey/niasclCcEqrp81B669HoPo0yAEmaBBcpuTOZQegF9S6gdUaJqms0vdRL3JYXQdEHLueD9snlovpxc2qnd8nfiIues9gXYEx30INLFvAksB1IIPcAd9LdaPY1oEcw4HqiE2ecJ7DvHegSlGh/Y0FgywP3uhPeDRae9TG4P7nArjHQ8W2oG1KgIkATUcmpYJNonjeC+TCMyZJwFOMfR+BadaCdo3DcdhRVT5kkTZOkC/VjJ3GKqUNHSA3NTCsR1+BAz1RrPwaFtQYH/kZF/5GKa/wDDtK86rC6fMkAAAAASUVORK5CYII=","bio":"Displaced oblique fracture of shaft of right femur, init","website":"https://go.com/dignissim/vestibulum.aspx?ut=accumsan&rhoncus=odio&aliquet=curabitur&pulvinar=convallis&sed=duis&nisl=consequat&nunc=dui&rhoncus=nec&dui=nisi&vel=volutpat&sem=eleifend&sed=donec&sagittis=ut&nam=dolor&congue=morbi&risus=vel&semper=lectus&porta=in&volutpat=quam&quam=fringilla&pede=rhoncus&lobortis=mauris","is_business":false,"counts":{"media":502,"follows":340,"followed_by":793}},
											{"id":"1265892776","username":"bgraddell3","full_name":"Breena Graddell","profile_picture":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAHiSURBVDjLhZPJbhpBEIbnJXxNxFsgjfJ8VixjYscXx7EdKzdWgdgFDggQm0CsZhFCCIEAcRx7EN2Mfnd1xATEkkNdqvr/6q/uaqXVaqHZbKJer6NWq6FaraJSqaBcLqNUKp0BUE6F0mg0YBjGXozHYwnJ5/MnIQp1JsFoNJKdh8OhCaGccIFMJnMUopBlOkzdKFEsFsuapoFzLvMEzOVySCaTByEKdd0cFOKVsDxaLpfg8xlY6o+sDQYDpNNpJBKJPYhCnTeW1+s1SLxeLMC+2cC+noMlX2St3++TC0Sj0R2IImbUF0JAhxhj4DPR2W4Dv78Df3oAu74yIb1ej1wgGAyaEKVQKHwRM+rz+fwv5LUFdnEO/nAP/vsZ/NfjDqTb7ZIL+Hw+CZGUbDarihn1meguIZ0OVleX4I9bEPslWCIu6+12m1zA4/GcmbOkUilVzKhPp9N9yPMT2O0NtO/XMMTrkItwOAyXy/V550bFfGo8Htcnk8k/iO0C7MaO958/sHrTtsUWc4TtiMViaiQS0WkTJaT9ipUQG+J1NmKn02kxL/HQcoRCITUQCOi0iZsnJrHI74iPAij8fr9V3LROC9YRoxwSnwRQeL1eq9vt1knscDgsB1f5f99VdLUK8adj9Q9ogTPkuLLcmwAAAABJRU5ErkJggg==","bio":"NIHSS score 18","website":"http://infoseek.co.jp/luctus/et.json?lorem=neque&ipsum=duis&dolor=bibendum&sit=morbi&amet=non&consectetuer=quam&adipiscing=nec&elit=dui&proin=luctus&risus=rutrum&praesent=nulla&lectus=tellus&vestibulum=in&quam=sagittis&sapien=dui","is_business":false,"counts":{"media":425,"follows":887,"followed_by":203}},
											{"id":"9424187599","username":"hvasovic4","full_name":"Hope Vasovic","profile_picture":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAALKSURBVDjLldNbaJt1HMbx73tok7Q5tukhmzXNShuHXgwvlIEIgpp5pgqiIN5PUPBw4RClKjjwxhvZcDeCeKEgu1mKMUWYVFQUPFRZOrtmW0zWxKZdm3fNm/f0/3nVguIm/u6fz83veTQR4f/cSjFf9FwpWM2geOdzq7PmfwbO5EcUjOgaV5TIy2E99lAqPERtc/VhgBsC1VL+AzQeEJ+EpyQaiyT1+vm2oFyt60jpukC1lJ9WwlI8Uwgn9j+GJgH2HyXctZ+JRzyturY19/jbF9/8V6Bayj9hhIc/i4/Nkkjfhl0/RbDTxmu3EC1KenKY2p9bTwN/B6qlfAb4KJK+/d7YyCx9hoN9+X2UY6NcBz0SRnwbzCFGo+bUbs68MJ+f1g2+CnzGU5NPacmJR3A3vsC6soiybfyeg73dJdQv9JuCBIJlK7UH+I6cTE8fysRHjxA4K3jNE+jeNuK5dDYsvB0Xr+dhJjUwTFSg2N5RrT3As+RgaDCNs9Ng+dsi/f2KPokSAuKJPmprFoYIhmjogzfT63RxXPl+F9Dta2q+WfkV33cZGJiiXonTbA1wqbZO91qPqVuimLpis+Lx+4c/sXLiOxJLjbvL95uvAmgiwuJ7B76JZVKHp+44wpenihSOPou91eaHcpGU0WHIN+mujzBzz5OEcrdiL5U5t7gQXF2uvKjtVnnh+IHz8X3JGdQMo9mbGM8lqJ+r8PmnRQ5edbjr6HEiq2eh8TUkkrTNLD+WFy/uvfG+Y9X8mbnc6cHE8uyFzcv8smAxlh3DVILeVYTHc/DgS3t9MecyGEqb1P45ptOv5QqIlDLZFBOH9mMGPr+9e5bDjz7DYG0ex27SBayOwfIqDe16a/zklcm3UPL66L4YqY6P11RMDPmYeh1r3edSywi8nryh3WjOH7+QNVxHjnkezw87Eh3YaGkhT8KBIQ2Bk4Wy/85fhGJYxwKt7REAAAAASUVORK5CYII=","bio":"Nondisp fx of lateral end of left clavicle, init for clos fx","website":"http://china.com.cn/donec/odio/justo.json?velit=proin&id=at&pretium=turpis&iaculis=a&diam=pede&erat=posuere&fermentum=nonummy&justo=integer&nec=non&condimentum=velit&neque=donec&sapien=diam&placerat=neque&ante=vestibulum&nulla=eget&justo=vulputate&aliquam=ut&quis=ultrices&turpis=vel&eget=augue&elit=vestibulum&sodales=ante&scelerisque=ipsum&mauris=primis&sit=in&amet=faucibus&eros=orci&suspendisse=luctus&accumsan=et&tortor=ultrices&quis=posuere&turpis=cubilia&sed=curae&ante=donec&vivamus=pharetra&tortor=magna&duis=vestibulum&mattis=aliquet&egestas=ultrices&metus=erat&aenean=tortor&fermentum=sollicitudin&donec=mi&ut=sit&mauris=amet&eget=lobortis&massa=sapien&tempor=sapien&convallis=non&nulla=mi&neque=integer&libero=ac","is_business":false,"counts":{"media":333,"follows":549,"followed_by":287}},
											{"id":"9822880170","username":"kgowland5","full_name":"Keary Gowland","profile_picture":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAH8SURBVDjLjZPLaxNRFIfHLrpx10WbghXxH7DQx6p14cadiCs31Y2LLizYhdBFWyhYaFUaUxLUQFCxL61E+0gofWGLRUqGqoWp2JpGG8g4ybTJJJm86897Ls4QJIm98DED9/6+mXNmjiAIwhlGE6P1P5xjVAEQiqHVlMlkYvl8/rhQKKAUbB92u91WSkKrlcLJZBK6rptomoZoNApFUbhElmU4HA4u8YzU1PsmWryroxYrF9CBdDqNbDbLr0QikUAsFkM4HOaCVCoFesjzpwMuaeXuthYcw4rtvG4KKGxAAgrE43FEIhGzlJQWxE/RirQ6i8/T7XjXV2szBawM8yDdU91GKaqqInQgwf9xCNmoB7LYgZn+Oud0T121KfiXYokqf8X+5jAyR3NQvtzEq96z4os7lhqzieW6TxJN3UVg8yEPqzu38P7xRVy+cPoay52qKDhUf0HaWsC3xRvstd3Qvt9mTWtEOPAJf/+L8oKAfwfLnil43z7Bkusqdr2X4Btvg1+c5fsVBZJ/H9aXbix/2EAouAVx4zVmHl2BtOrkPako2DsIwulexKhnG/cmfbg+uIbukXkooR/I5XKcioLu+8/QNTyGzqE36OidQNeDJayLe7yZBuUEv8t9iRIcU6Z4FprZ36fTxknC7GyCBrBY0ECSE4yzAY1+gyH4Ay9cw2Ifwv9mAAAAAElFTkSuQmCC","bio":"Type III traum spondylolysis of 7th cervcal vert, 7thG","website":"https://netscape.com/sem/praesent/id/massa/id.json?mi=lorem&sit=vitae&amet=mattis&lobortis=nibh&sapien=ligula&sapien=nec&non=sem&mi=duis&integer=aliquam&ac=convallis&neque=nunc&duis=proin&bibendum=at&morbi=turpis&non=a&quam=pede&nec=posuere&dui=nonummy&luctus=integer&rutrum=non&nulla=velit&tellus=donec&in=diam&sagittis=neque&dui=vestibulum&vel=eget&nisl=vulputate&duis=ut&ac=ultrices&nibh=vel&fusce=augue&lacus=vestibulum&purus=ante&aliquet=ipsum&at=primis&feugiat=in&non=faucibus&pretium=orci&quis=luctus&lectus=et&suspendisse=ultrices&potenti=posuere&in=cubilia&eleifend=curae&quam=donec&a=pharetra&odio=magna&in=vestibulum&hac=aliquet&habitasse=ultrices&platea=erat&dictumst=tortor&maecenas=sollicitudin&ut=mi&massa=sit&quis=amet&augue=lobortis&luctus=sapien&tincidunt=sapien&nulla=non&mollis=mi&molestie=integer&lorem=ac&quisque=neque&ut=duis&erat=bibendum&curabitur=morbi&gravida=non&nisi=quam&at=nec&nibh=dui&in=luctus&hac=rutrum&habitasse=nulla&platea=tellus&dictumst=in&aliquam=sagittis&augue=dui&quam=vel&sollicitudin=nisl&vitae=duis&consectetuer=ac&eget=nibh&rutrum=fusce&at=lacus&lorem=purus&integer=aliquet&tincidunt=at","is_business":true,"counts":{"media":596,"follows":180,"followed_by":547}},
											{"id":"5560994774","username":"bgipp6","full_name":"Betsy Gipp","profile_picture":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAFySURBVDjLpZM9a1RhEIWf7C6mWASLSEBsbUWb/AdrW8HKRrC3EgWttbCzUgQRtRK0ERVEm/Q2aiPoBtJEosZ7Z+Yci3tvdosgKxkY5m3eZ77OrNjmMDYBePhu55rNpbJOSqIEKVElSiZLC15UmpI2b104tTEBkH3l/MbRtf/JfP3x59P7FZS0BjB9dhlsqAQVRHTvtoFooQmI4NfV10TU6gJgmIPhxHFQdu7sIQ1EA9nCxxkAkTWfQZV6wAp83warq0TqKqkhAuvrALQ9ANvcfTnzz72wbd9/M/tnfPLhm7d/7Pni7U3bZgQQJbTkOpswu7+DNroKRkMLy6qhyaINkak5IEpYSwJC/bgXASmWVWT0maerkzkgpaUFNACGzU0AMhMDD95uMR51UTb3Xs2IKu68+Eobxc2nXzgy7j6ORwu3ENW1cO7sMbIG7Xv/Fg4yqZtaLyS/v/Ho05m2NI0sIotKESWy8kDAzu6f5wArhz3nv90eObvZ0Hw1AAAAAElFTkSuQmCC","bio":"Drown due to being washed overboard from water-skis, sequela","website":"http://usa.gov/blandit.json?parturient=luctus&montes=tincidunt&nascetur=nulla&ridiculus=mollis&mus=molestie&vivamus=lorem&vestibulum=quisque&sagittis=ut&sapien=erat&cum=curabitur&sociis=gravida&natoque=nisi&penatibus=at&et=nibh&magnis=in&dis=hac&parturient=habitasse&montes=platea&nascetur=dictumst&ridiculus=aliquam&mus=augue&etiam=quam&vel=sollicitudin&augue=vitae&vestibulum=consectetuer&rutrum=eget&rutrum=rutrum&neque=at&aenean=lorem&auctor=integer","is_business":false,"counts":{"media":158,"follows":584,"followed_by":397}},
											{"id":"5255017795","username":"bcorben7","full_name":"Bogart Corben","profile_picture":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAK/SURBVDjLjdJZSNMBHAfw1UMPhfTUQ5bgkfWQSodmYplroiAkXkvXcnOVipqsWhLKXEvnUEHUOecU72tec8vEVgQamUfeUzzThcc2QUqd+09b+u0pMxTz4fv04/d5+PIlASAdFG6wJWsk3351ofoMZstszKVs22I/V9tjf+4HPrN9z1I0lTZbizWnsTsFsXbZhwKKmadEi03O0KoiQHRnQit3x6LMCqP5dj8OBUiCT2bqhlRY/SyBeagchk4JFgZb0ZZyWXMoIND3buRY1bPtteFGbI03wTiqhK5dhGSGp3xfIJJsz8pj3V4VhZEhCaeYo0Mc+0QvYn/q5BzMv34FXXMSOqSP4RRxsdUl3uHEPwDT/Rwlj+W1lU0nY3dKstjILRAgQ8yFMtcf4y001CjC4ci7UHaJc/74DpAVcqWjMNofTfyHGKvhoppDhSiMAmmUF0qHuGh5Q8VyDxtmQw/mP9xHRhUNbtEukh1AHGLXMN0m21OYLJEMueoelj6GwbxSiZVRPpa7eJioCMBQmsf/C0tPCUanwg+b3+uwoeVhQ1+IlWEeiDk+pqSef4GjV3MSxAlxewpzoD5HRYkP1mfSQXyLgWmOA0LDBDFFRT/fzUQCQDriXvsokNNvaNcDwno5kkpkiBeVobZtAL3VUVDLQw1rkwwQ034wzdBhnKCin+9kqgi1ppFsfKVUKrvF2Dy+BcEYEPEFYLQDwvoWfCoLBzFXAOPXIBCT3ujLdl0fTHHRqwXX9DKGdRAAEkktcP7V15gLjkIHpgpgKrdBl22jqy4GG9pyrKmvgxjzwYD4Bgrodg9UQZYW7Qwri50haXJuaRtTn4LG60bke4D1FmAogS4FG5tLQhgn76A7xwO9wpvYb62kycoot9bkwERXapXS+UkvyDw1yLwRpKW+RHdRAN4Jvc1FcV4Ns6U0+n7Ab/dSu26WPRQHAAAAAElFTkSuQmCC","bio":"Sltr-haris Type II physeal fx phalanx of unsp toe, 7thD","website":"https://unc.edu/interdum.jsp?lobortis=in&est=faucibus&phasellus=orci&sit=luctus&amet=et&erat=ultrices&nulla=posuere&tempus=cubilia&vivamus=curae&in=mauris&felis=viverra&eu=diam&sapien=vitae&cursus=quam&vestibulum=suspendisse&proin=potenti&eu=nullam&mi=porttitor&nulla=lacus&ac=at&enim=turpis&in=donec&tempor=posuere&turpis=metus&nec=vitae&euismod=ipsum&scelerisque=aliquam&quam=non&turpis=mauris&adipiscing=morbi&lorem=non&vitae=lectus&mattis=aliquam&nibh=sit&ligula=amet&nec=diam&sem=in&duis=magna&aliquam=bibendum&convallis=imperdiet&nunc=nullam&proin=orci&at=pede&turpis=venenatis&a=non&pede=sodales&posuere=sed&nonummy=tincidunt&integer=eu&non=felis&velit=fusce&donec=posuere&diam=felis&neque=sed&vestibulum=lacus&eget=morbi&vulputate=sem&ut=mauris&ultrices=laoreet&vel=ut&augue=rhoncus&vestibulum=aliquet&ante=pulvinar&ipsum=sed&primis=nisl&in=nunc&faucibus=rhoncus&orci=dui&luctus=vel&et=sem&ultrices=sed&posuere=sagittis&cubilia=nam&curae=congue&donec=risus&pharetra=semper&magna=porta&vestibulum=volutpat&aliquet=quam&ultrices=pede&erat=lobortis&tortor=ligula&sollicitudin=sit&mi=amet&sit=eleifend&amet=pede&lobortis=libero&sapien=quis&sapien=orci","is_business":true,"counts":{"media":231,"follows":108,"followed_by":335}},
											{"id":"4037977419","username":"amowat8","full_name":"Almira Mowat","profile_picture":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAKmSURBVDjLjZPdS5NRHMf3D+h9XXVZRGBXBpYEdSGUaNkLoZWPmNNEI4tekMg0c+HKGLoldhFuBa2bKSm57WI2Wcryhfm4t/biptNRc29uzu2Z+/acU4+Y3njgy++cH+f7Ob/zJgIg2imTyVRkMBh6dTrdzMjIyG+NRhNRq9UOlUql+KBUnN49f7tjNpvzeLOcN2f8fj/C4TDi8TiSySRisRhsNisUfZ1cv7xD2SuT5P8H+Gf+6na7kcvlkEqlQCA+nw+hUAjZbBa57Aa4DQcM+o/ofvnQKOl6kr8NICsTcyaTAWkcx4GMXS4XotEohaY3VrCZsGJr8ye0o+/R/rRJSQG8+QRf9lYikaCG9fV1CgkEArDb7SD5bJZDMmZHOmGjVWR4tdyt37p/r7FIxJvlS0tLIHI4HNRE9kxAq6urtJ/ejPEAljf6+f4aX2EaRqMRYrFYLiooKMB+Rc6GgCORCDweDxiGmaMAlmXhdDoxMTGBwcFBOpnE5eVlmhdy5GC9Xi8WFxcRDAZRWVkZogAySTARCBHJCXkhmha8mGJdVHbfCi5UXFnbAyASzDsBZcxZtChuou51GW5IStCh7ERJ2SXrni0IIBKFLXS+fYxnnxl8Yfswt6JFj+42rvYcwynmqGVfh1j1/AyG5t9gyCqjVyzV30KPXozCxgNp+pBkMpl8fHwcwSh/lQELrL5ZzHt+YNY5hWm7Cedbj2OUfYedbdjSRwB/37NUKs3reNGu/zSsgueXjUIIYMY5iWnHdxTfOYRubQ26tNXU3DVWLVSQ2v5MbW1teY9aHww0NNdxmjE1Jue/UYjFbUbrQD0qpIfxSltLVyaRjHmAVLT7ezY3N52sa6jtv15TxV6+djFcXlEaLi0/xxYzR2YLGw8mSdm84rwkZP4fYOfdUwjREaAAAAAASUVORK5CYII=","bio":"Encounter for adjustment or removal of right breast implant","website":"http://odnoklassniki.ru/cursus/id/turpis/integer.aspx?at=id&velit=justo&eu=sit&est=amet&congue=sapien&elementum=dignissim&in=vestibulum&hac=vestibulum&habitasse=ante&platea=ipsum&dictumst=primis&morbi=in&vestibulum=faucibus&velit=orci&id=luctus&pretium=et&iaculis=ultrices&diam=posuere&erat=cubilia&fermentum=curae&justo=nulla&nec=dapibus&condimentum=dolor&neque=vel&sapien=est&placerat=donec&ante=odio&nulla=justo&justo=sollicitudin&aliquam=ut&quis=suscipit&turpis=a&eget=feugiat&elit=et&sodales=eros&scelerisque=vestibulum&mauris=ac&sit=est&amet=lacinia&eros=nisi&suspendisse=venenatis&accumsan=tristique&tortor=fusce&quis=congue&turpis=diam&sed=id&ante=ornare&vivamus=imperdiet&tortor=sapien&duis=urna&mattis=pretium&egestas=nisl&metus=ut&aenean=volutpat&fermentum=sapien&donec=arcu&ut=sed&mauris=augue&eget=aliquam&massa=erat&tempor=volutpat&convallis=in&nulla=congue&neque=etiam&libero=justo&convallis=etiam&eget=pretium&eleifend=iaculis&luctus=justo&ultricies=in&eu=hac&nibh=habitasse&quisque=platea&id=dictumst&justo=etiam&sit=faucibus&amet=cursus&sapien=urna&dignissim=ut&vestibulum=tellus&vestibulum=nulla&ante=ut&ipsum=erat&primis=id&in=mauris&faucibus=vulputate&orci=elementum&luctus=nullam&et=varius&ultrices=nulla&posuere=facilisi&cubilia=cras&curae=non&nulla=velit&dapibus=nec&dolor=nisi&vel=vulputate&est=nonummy","is_business":false,"counts":{"media":406,"follows":980,"followed_by":682}},
											{"id":"4930872251","username":"vpervoe9","full_name":"Vanessa Pervoe","profile_picture":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAADdSURBVDjLY/j//z8DJZhhmBvw41KQ07dzbk5kG/Dtgu/Jb2fsT5JkwI+bqZw/rsfYA21v+XE97f+PS5H/vx5Ra/98QN7+824ZTiIMSJr580bW/x+3iv//etD9/+fdpv/fzwX+/3LY6P/n7TIzCRtwPYYZaPvGH7dKgAb0AA1o/v/tQsh/oO0bP26TZiYqDIB+1/1+wef/z3vN/3/erPr/5aAOyHZdogMRGPIe38/7gvz+Gej3z18OG/8H2u5BvAFn7GO/Htdv/3pAQejzXjkhoO3tH7dIxY7EpEwMBgAr6O5Q8udliwAAAABJRU5ErkJggg==","bio":"Puncture wound w/o foreign body of unsp part of thorax, init","website":"https://freewebs.com/fusce/lacus/purus/aliquet/at/feugiat/non.js?nibh=elementum&ligula=nullam&nec=varius&sem=nulla&duis=facilisi&aliquam=cras&convallis=non&nunc=velit&proin=nec&at=nisi&turpis=vulputate&a=nonummy&pede=maecenas&posuere=tincidunt&nonummy=lacus&integer=at&non=velit&velit=vivamus&donec=vel&diam=nulla&neque=eget&vestibulum=eros&eget=elementum&vulputate=pellentesque&ut=quisque&ultrices=porta&vel=volutpat&augue=erat&vestibulum=quisque","is_business":false,"counts":{"media":678,"follows":110,"followed_by":962}},
											{"id":"4220754423","username":"lfauscha","full_name":"Luisa Fausch","profile_picture":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAIfSURBVDjLpZPNS5RRFMZ/577v+L5jmlmNoBgE4iLIWkgxmTtx4R8QLXLRB1GYG4lAwlWkCH1sShcRuIgWYUQoBIUVgojLyowWLSRhSCNtchzn672nxYxT6hRBD/cuzuW5D+c5H6Kq/A9cgM6+0VtBTk4tJwM/kS7BspvDsAc7w4w8uXGyxwUIrHRev9AcqYlERMRFAS3+E1RBdSNWglyGs9eenwbyAsuJwIvsjUjX7QfU7duF51gC9cBUYYT8NYJjhM8fZ+nvuUg2EClaSKbBGJfGhv0cjLbiGAfVAMQFEYwIIgZjDCHHYO2WGmzY9DwfP1yRz/cv0KLJLQLZTIpsah1EULVYDbDWIICq4khALpNE1W7PQBW+xmN8W4qTtTmsBvxIL5IJ6pECp8ZbYX0tDmpKC3xZLCe0kPr1oBFUU0XyCmEWFnT7HNgC3zhlGMcr6TtITJBLvKK6+jtX7z/ElDV4cGJzBn9COv6MPZXTNDcfpX53I6/nnrL+ftKPdtfddAHUWgRYmp8rKRAKPabtSAeBCThc287Eh1GiTS3Mfxq75OZnLd+coYG+YvQ7rtzpJyQVdBw4B8DltnuMzw4DY74LsDNs4jaXqqotl3wLC4KFw+panLnYNG9jU/S2jzD44gx+vlYpF2CHZx6dH3h5LJnVJmtL7dJxf+bdtNdyqJXx2WHKxGXqzSTAkPzrOke76waBLqASWAWGZ+7Gen8CJf/dMYh8E3AAAAAASUVORK5CYII=","bio":"Unsp pedl cyclst inj in nonclsn trnsp acc in traf, sequela","website":"https://amazon.com/vel/dapibus/at.js?iaculis=pharetra&diam=magna&erat=ac&fermentum=consequat&justo=metus&nec=sapien&condimentum=ut&neque=nunc&sapien=vestibulum&placerat=ante&ante=ipsum&nulla=primis&justo=in&aliquam=faucibus&quis=orci&turpis=luctus&eget=et&elit=ultrices&sodales=posuere&scelerisque=cubilia&mauris=curae&sit=mauris&amet=viverra&eros=diam&suspendisse=vitae&accumsan=quam&tortor=suspendisse&quis=potenti&turpis=nullam&sed=porttitor&ante=lacus&vivamus=at&tortor=turpis&duis=donec&mattis=posuere&egestas=metus&metus=vitae&aenean=ipsum&fermentum=aliquam&donec=non&ut=mauris&mauris=morbi&eget=non&massa=lectus&tempor=aliquam&convallis=sit&nulla=amet&neque=diam&libero=in&convallis=magna&eget=bibendum&eleifend=imperdiet&luctus=nullam&ultricies=orci&eu=pede&nibh=venenatis&quisque=non&id=sodales&justo=sed&sit=tincidunt&amet=eu&sapien=felis&dignissim=fusce&vestibulum=posuere&vestibulum=felis&ante=sed&ipsum=lacus&primis=morbi&in=sem&faucibus=mauris&orci=laoreet&luctus=ut&et=rhoncus&ultrices=aliquet&posuere=pulvinar&cubilia=sed&curae=nisl&nulla=nunc&dapibus=rhoncus&dolor=dui&vel=vel&est=sem&donec=sed&odio=sagittis&justo=nam&sollicitudin=congue&ut=risus&suscipit=semper&a=porta&feugiat=volutpat","is_business":true,"counts":{"media":561,"follows":473,"followed_by":501}},
											{"id":"0075380196","username":"areuvenb","full_name":"Archibold Reuven","profile_picture":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAMDSURBVBgZpcFNaJt1HMDx7/PkSdombdO0Tedo2q6H2VSnlZXBylAUN/HiRRBksNsQ8eLNsyBFL9tJUA+CMnUiXmSbgqOjgyF9YVu3pmvarG+sa+eatmmb5snz8v/9zA4Dkd38fCxV5f9w3h2+0pJpb7zeHI9lUAtUMKqYIMDzAoIgwK96eJ5H6HqYqovvViltbK+tzC6edHo6mqaHXuzK9B5o5QlR5QkjiohiVDFGMKIYYzCiBMZwa+pe66i3O+t0tiUy6XiE+ZVHhMZwc3qZ44NZJm/P88qRbsJAuJ1bpr//EDduTNN1qANjhOczSdLPHUw5lgWiSjRisVUWKqFFxUTZqgRcGytgjCBq49OAZ8XYLO7Sk0kRimBZFtanF/5SO3SxRbHsCENH+9j2YxgRjCgiEBohFKHZqTAyMolX3iT0AzYe7uKMz6ycyab1i7ZkIpJOZw5EYg3WWmGWtUeb+KEhDA3GCKFRzmTzfPjCEpNL9Q+uLGaK92cnzqOqqCofnbv00/dXczq+sKf5v43+1+UfPtfi+Mca7I3r8u+n/ZvDh99WVSxV5b3Pfuvu70zOnRjM1ifijfR2xOlM2jy1c+9X/OIlUgOn2F9dINwTdu7frcxN3jkbGd3LWnZl/+obx/t64vEmYrEYPW1R6hyLp3ZyF2gZeA1x8ziJTsTfpSV7MBopbZ+0R8+9r9n+3sFUS4r1UoARoSFq8W+RRIZgexnxi6g/R6x5BaozlNe9iENN1Rd7vVhiYX2fqtfOyNgMbtUnZZZ5MzlCY5PQ3WJhSwnsJjTwyV0s6Nxc6QOHmjAICIzghyH5xVWMKIdlgmN1Y7z86inU/xPL7HHncgVT3iVm23ybHwi/+fm7iw41Vd/HdX262uswoYOo8rrm6DvxDn7xKxwnSe6az/X9t6i0H8WtuBTcW0KNQ83SVC5febyRjdYnEBMiIgwdCbAiD4nUpZn6Y4cf777EA00ihQLVcpnHq6tfUmOpKs8ycf7YcGNr6mxla9+dn9/45PTX87/wDP8ABifE0eTdPioAAAAASUVORK5CYII=","bio":"Maternal care for fetal problem, unsp, unsp trimester, oth","website":"https://hao123.com/sit/amet/consectetuer/adipiscing/elit/proin/risus.jsp?morbi=blandit&non=non&lectus=interdum&aliquam=in&sit=ante&amet=vestibulum&diam=ante&in=ipsum&magna=primis&bibendum=in&imperdiet=faucibus&nullam=orci&orci=luctus&pede=et&venenatis=ultrices&non=posuere&sodales=cubilia&sed=curae&tincidunt=duis&eu=faucibus&felis=accumsan&fusce=odio&posuere=curabitur&felis=convallis&sed=duis&lacus=consequat&morbi=dui&sem=nec&mauris=nisi&laoreet=volutpat&ut=eleifend&rhoncus=donec&aliquet=ut","is_business":true,"counts":{"media":452,"follows":810,"followed_by":824}},
											{"id":"3475338556","username":"tchanningc","full_name":"Thatcher Channing","profile_picture":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAEgSURBVDjLrZMxSkQxEIa/J2IhVmKlF/EWVl7FW3iNrS28wna29iKIKNgIvrfZzPy/Rd7uIu5jFzQQApnMN18mpLPNX8bhrgO396+bCoaUubk67/YGAFycHiEbCZ7fFz9iB/sAVslKU9Pbr3D30NuAEgzYcH153EWaDJBMpqhlApCCs5MDBFjw9ikAIkSkUJqQKDW2A2xIt1WGaPnUKiJa9UxPG0SCtAFktv1l9doi05TI7QCNBtJPg2VNaogcLWrdYdAARtkItSRRW/WQqXXCINQaKbsZjOdKNXWsLkFMPWOmSHWbHnjVxGzJ2cCSJgwMLx9Jji+y+iKxNI9PX78SV6P7l880m81cSmEYBhaLBX3f/5rDMKzjpRTm83n3LwbfdX8jZ1EmeqAAAAAASUVORK5CYII=","bio":"Nondisp oblique fx shaft of r tibia, 7thB","website":"http://answers.com/molestie/hendrerit/at/vulputate.json?id=non&sapien=velit&in=donec&sapien=diam&iaculis=neque&congue=vestibulum&vivamus=eget&metus=vulputate&arcu=ut&adipiscing=ultrices&molestie=vel&hendrerit=augue&at=vestibulum&vulputate=ante&vitae=ipsum&nisl=primis&aenean=in&lectus=faucibus&pellentesque=orci&eget=luctus&nunc=et&donec=ultrices&quis=posuere&orci=cubilia&eget=curae&orci=donec&vehicula=pharetra&condimentum=magna&curabitur=vestibulum&in=aliquet&libero=ultrices&ut=erat&massa=tortor&volutpat=sollicitudin&convallis=mi&morbi=sit&odio=amet&odio=lobortis&elementum=sapien&eu=sapien&interdum=non&eu=mi&tincidunt=integer&in=ac&leo=neque&maecenas=duis&pulvinar=bibendum&lobortis=morbi&est=non&phasellus=quam&sit=nec&amet=dui&erat=luctus&nulla=rutrum&tempus=nulla&vivamus=tellus&in=in&felis=sagittis&eu=dui&sapien=vel&cursus=nisl&vestibulum=duis","is_business":true,"counts":{"media":980,"follows":574,"followed_by":528}},
											{"id":"7680833885","username":"agascard","full_name":"Allister Gascar","profile_picture":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAANDSURBVDjLXZNLaFxlAIW/+5hn5pkXMWFSU0uN9mFaUlNIUqmkjVIFFRVEUczChVKyduNOETeC+FipEcXajS0VrcQWW2zEllSSUkNK0pjUJNPJZGYyd5I79/H/93dTS/EsD4ePs/k0pRT3ZnRiZBA4DhwAWgATqAKXVaA+/Wjwy5/v3Wv/AUYnRkxgDHj+6dxQJBtrwbIbsD0Q0kFQ4Hz+rJBC/iKEfPHzJ7/bvAsYnRgJAb/2Nu/qP5o7jOVEcPGYtzTCKkLJDlDCI4ZN3v2NydXJa8IXh7594XRVv/NkbH/Tzv6B9l7K0sPXNYTQqYswNmHKboQ1J8ZyNURn4lF62x7c67n+CQCjcuTWAPDByzufMq7LLfLUqQeCTSdB2Q1hOTC3UqO6tUUkW0JLz3GwuZvzM1e2f315bNroG9n34XB7327NiJHXBahW7pMJrhYM6o7OzMomQbRCZNsN3NQcxaCCWZHsbsrpVxdnG03gQC7VwZS9SjGq87DxAAGCpTUPx6mTblNYjePMBxvgKjIiwlzRZej+/fiu2GMCTXGzgSV7lTXXJhnfzoaXpFIJSLc4tGZtirIHy50momrU1kuUN+IkYkl8T2RMpZSmKfBcC0UOMyQ5+4ePFkuQnxfoKkV7S51kbRBrxcdhEt/7G5RCCKGZUgRly7M6mowMyegjLBdNHD9EOBoh2hrj5kIJ50qGwcJpjuZ/ILb+D1upGKUNiRRB1RS++HOxfKtjRzzHudsTZOI7CBs5fMdGGRnCiSwHF09xLDTJQ6+9RaRrF/Vr4/x16RxDVtHSfU98/P3sRbEt0YJpr1At/U4262IKl5CmiOgG3de/ofvwc0RvXkD76iXiC6fo6mxkoLCe0b84dnLcc/2fxmcu8lhHD2mjgWwiIB2WpMIOyZBLdrNAtK0Ljp+B98vw9gLm1ixxXzWbAL7rv3JhbuqSW/f2Du87xI01E6OqEFoNP9CxU43YUz/ScOZN3PptbKBmGUiD1bsyPfHJ40nhi5PCl0de7X/dRLahVBxN18hNnyA1fZHORh9TX6ZWFCwWDOk76h3t/zr3v9v3rBTyDSmDPYEMsnfq6jMl2+5ZWkzHPdUkDbWi4LPhcfHevzBSqkykNJyOAAAAAElFTkSuQmCC","bio":"Pathological fracture in other disease, right ulna","website":"https://rambler.ru/sed/accumsan/felis/ut.jpg?risus=pellentesque&semper=viverra&porta=pede&volutpat=ac&quam=diam&pede=cras&lobortis=pellentesque&ligula=volutpat&sit=dui&amet=maecenas&eleifend=tristique&pede=est&libero=et&quis=tempus&orci=semper&nullam=est&molestie=quam&nibh=pharetra&in=magna&lectus=ac&pellentesque=consequat&at=metus&nulla=sapien&suspendisse=ut&potenti=nunc&cras=vestibulum&in=ante&purus=ipsum&eu=primis&magna=in&vulputate=faucibus&luctus=orci&cum=luctus&sociis=et&natoque=ultrices&penatibus=posuere&et=cubilia&magnis=curae&dis=mauris&parturient=viverra&montes=diam&nascetur=vitae&ridiculus=quam&mus=suspendisse&vivamus=potenti&vestibulum=nullam&sagittis=porttitor&sapien=lacus&cum=at&sociis=turpis&natoque=donec&penatibus=posuere&et=metus&magnis=vitae&dis=ipsum&parturient=aliquam&montes=non&nascetur=mauris&ridiculus=morbi&mus=non&etiam=lectus&vel=aliquam&augue=sit&vestibulum=amet&rutrum=diam&rutrum=in&neque=magna&aenean=bibendum&auctor=imperdiet&gravida=nullam&sem=orci&praesent=pede&id=venenatis&massa=non&id=sodales&nisl=sed&venenatis=tincidunt&lacinia=eu&aenean=felis&sit=fusce&amet=posuere&justo=felis&morbi=sed&ut=lacus&odio=morbi&cras=sem&mi=mauris&pede=laoreet&malesuada=ut&in=rhoncus&imperdiet=aliquet&et=pulvinar&commodo=sed&vulputate=nisl","is_business":false,"counts":{"media":550,"follows":350,"followed_by":658}},
											{"id":"7846898892","username":"lwolfite","full_name":"Lynea Wolfit","profile_picture":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAKoSURBVDjLdZPBTxNREMb5B7h41LuJB+8mJiaGxIheOEhCJMiBaAjRiwdR9KAkBEFiNDYtYFQMEiIBDIQgYGlBS0tLwW1LgUILtBbL0m67bWmXXdh+zisFCsFNfvs2OzPfm/dmpgBAQT5ljSOXCQ0xR4SJGOEhdMx20j8/sJDQEsrorB/zgTjWIjI2krsICtv4MRcAs+V8Co8J5IJHuowe7KkZBONAvy2BPmcC04IMiZxUgtmYD/M9EDkQ0DKDqCD7JMm7c1JEhzkKh6giQ/9oQVzdt+dEtFkB+rhEqH5BQaclguXIvtPwrATdeATebWQz2KRXklaZkckwAZXFZncfo/MNO+N4PxlGmzEMVxBY2QQsy0k6zg6EHYAngfCGHktdZVgZaAD34Ro0rx+OMwHO4Rfx2bRFAjx0EzwG5+Lo+eVlu4QYvSYfhOAAQoZaiM4hSmUDMWcvjC0lu0wg4g6maGcebRTcTiJWX5IF/yXOMZp09dGo+wXkP4MITbxC2tWPvXUTuI/VmUMBnYGHVr8JjT4E2+qRgKWvqFxwPYOaNiHtuw/B9gCLnVVwdlSjpqk7lj0Ctx6D1hDKBn+1i3SRGbC0n79rjkZdT6BKFqS8lZAC5Ugs1GHlUwl+cxzbhDu8RPOqBAcPBNKALwFwdjrzTG0u+A4k/23E55/C03oTFjuHsf3G0h6WUaHS8FSjpRhgNg9hYfQRpf0T0loVdgIVECkTj64Y36a88GwpR2XMb6QwlUs/2g33cB0c398gaC1Faq0cAvcY7rYS9Js8sPmV4410spV7moqAxDqW2m/BUHcWU63FMDZfh9HmxiKvnN7K+cNUf+8iZIsGsvUtrA1X0VtzHtMzdrAB++8w5VN65YzcWHlB1b+8kelqqVDuNnyJ5kZbc9o4/wOexAeGRUz8AAAAAABJRU5ErkJggg==","bio":"Unspecified dementia without behavioral disturbance","website":"https://shop-pro.jp/orci/eget/orci/vehicula/condimentum/curabitur.jpg?vel=suscipit&nulla=a&eget=feugiat&eros=et&elementum=eros&pellentesque=vestibulum&quisque=ac&porta=est&volutpat=lacinia&erat=nisi&quisque=venenatis&erat=tristique&eros=fusce&viverra=congue&eget=diam&congue=id&eget=ornare&semper=imperdiet&rutrum=sapien&nulla=urna&nunc=pretium&purus=nisl&phasellus=ut&in=volutpat&felis=sapien&donec=arcu&semper=sed&sapien=augue&a=aliquam&libero=erat&nam=volutpat&dui=in&proin=congue&leo=etiam&odio=justo&porttitor=etiam&id=pretium&consequat=iaculis&in=justo&consequat=in&ut=hac&nulla=habitasse&sed=platea&accumsan=dictumst&felis=etiam&ut=faucibus&at=cursus&dolor=urna&quis=ut&odio=tellus&consequat=nulla&varius=ut&integer=erat&ac=id&leo=mauris&pellentesque=vulputate&ultrices=elementum&mattis=nullam&odio=varius&donec=nulla&vitae=facilisi&nisi=cras&nam=non&ultrices=velit&libero=nec&non=nisi&mattis=vulputate&pulvinar=nonummy&nulla=maecenas&pede=tincidunt&ullamcorper=lacus&augue=at&a=velit&suscipit=vivamus&nulla=vel&elit=nulla&ac=eget&nulla=eros&sed=elementum&vel=pellentesque&enim=quisque&sit=porta&amet=volutpat&nunc=erat&viverra=quisque&dapibus=erat&nulla=eros&suscipit=viverra&ligula=eget&in=congue&lacus=eget","is_business":true,"counts":{"media":348,"follows":441,"followed_by":294}},
											{"id":"5742127170","username":"tberif","full_name":"Tiena Beri","profile_picture":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAKFSURBVDjLhVNNaxNRFD3vzUwSJ622YEwgYoVaNBUVilZwqStBtJBNxC4EEel/sDsXLhRcVxSUQo07QVy0jbpQqiANsS5ciNpowBhM2kk7nWS+vPdJqi0tXjhz39x595zz7syIMAxRKBSilM8TLgZBcIjyAIGWwQfKnyjfIxRGRkZ8bAoxOzs7SJumEonE0VQqhXg8DtM0wcTLy8toNpsol8uo1WqvqJbLZrOVDQzT09MvFhcXWS7cLlzXDYvFYpjP5x8w8b+QdDmcTCbxv0in0yCRs5vrOhUVU7VaRSwWQzQahWEYqmbbNur1OiqVCvr7+5kA2xLouo5GowHHcdS953mwLAutVks949qWBJ2zaJqmHPBmxs0ndXRHe2G3PfR2RfBo/geEHEy8v1sKg1CgYa3hebFyct0BK9KwVBZCYM12cHr4IC4MdeHpm+8Yv5TZoPzwZY0cibeyQ+D7vmpm8Npuuag3PbV55l11vdGhktUCakttEgr+zoDVGdzMx5FSQAsB1w9we2yI1OioRKDR1dShZmOttv8QMDrqHcKYIeGQixv5ryAueEQUEJiEn/PCNAJIVuRXRV+ieoWd8Eix5XvQpEFWdZAfyho1SiIQcEmsTQNmB5fn5uYeZzKZeF9fnyLhITbtKgxqHDvXTWRtopRKNaRzx/QIbk2V8ctahZ7L5Z5NTk4eWVhYuF4qlbJSyl38L/hBijQNBFjD/flr2G3uIxcSNfsbrp64Q6sYDZpmwHZHR0e/ULrCmJiY6F5ZWTmg6+n5/Skg2dXEmWPD6ImklYklJ409cQ9mhD4icirUQLaI42Mzrwf27jjVE+0hyzvpGC4EDViEPgJh42P5M35aLn4DnlayCCcx84IAAAAASUVORK5CYII=","bio":"Blister (nonthermal) of anus","website":"https://goo.ne.jp/nunc/rhoncus/dui.html?viverra=hac&pede=habitasse&ac=platea&diam=dictumst&cras=aliquam&pellentesque=augue&volutpat=quam&dui=sollicitudin&maecenas=vitae&tristique=consectetuer&est=eget&et=rutrum","is_business":false,"counts":{"media":826,"follows":763,"followed_by":427}},
											{"id":"0488041333","username":"iwookeyg","full_name":"Ingamar Wookey","profile_picture":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAJISURBVDjLpZPfa1JhGMftuqvC41l1Hf0JrTtvuyropp8QOdCFWYJgoNC0yOwiiTFtYGCIhBXTs61yc7ZdzAhHiLpTFi21+fP4Y66ZLld9e1/rCIdVBLt4eJ/n8H6+3+9zDkcGQLaTkgzt+YEDYt+KsI/Efj3M7v4vgdaLgeMEbG/Msfs+h1nQZ83ZX+c/BQh0aCPCCrSn4Pos++NL8gzWZtj3jZCiJ1B7pghXnyp2/TUBiVmjbhTcKo+ju3ob3cJdEEgQphWoTCkm/5iAgCoKErexzoer+Jq7ic7bi+jwF7D5Tofup1toLp1AiWNUxSBzuBBg9mxLQGKyjchB4jhK4GF0ls+jkzqHdvIUmYfQyV5HPsB8W52Qn96WgOx2jMRstJaHifuN3/BZAp9E5fUV8C/HsBDh8Jx7sDX15F7Q5/MpJQJkv71kP2V5klnr5u9g880Q2gkKX8arhYfIZDKo1WqoVqtIp9Pw3HfxLpdLKVmhyDHXCkEGwpIKmZQPsUUO85Fp5HI5NBoNCIKASqWCer2OZDIJh8MxLhHITzCj9EzNXMLKykrPkV6mZ7lcRqlU6hXtqaDNZvtusVg8JpNpsL9L9rH86OKctx+XOoogrWKx2CtRJBaLwWAwePoCH/3yI6FQiKewKECj06KQWGISaqTT6ZqST8Jx3AjdkV6gbqlUColEou8ej8d7MzWIRqPQaDQeiYDf79/v9XpH3G4373Q6efKyPHa73Wu1WrNmszlrNBoDer0+pNVqm2q12qNSqQZlO/2dfwL4RvrQAqV2MgAAAABJRU5ErkJggg==","bio":"Greenstick fracture of shaft of radius, left arm","website":"http://163.com/in.json?ligula=non&vehicula=sodales&consequat=sed&morbi=tincidunt&a=eu&ipsum=felis&integer=fusce&a=posuere&nibh=felis&in=sed&quis=lacus&justo=morbi&maecenas=sem&rhoncus=mauris&aliquam=laoreet&lacus=ut&morbi=rhoncus&quis=aliquet&tortor=pulvinar&id=sed&nulla=nisl&ultrices=nunc&aliquet=rhoncus&maecenas=dui&leo=vel&odio=sem&condimentum=sed&id=sagittis&luctus=nam&nec=congue&molestie=risus&sed=semper&justo=porta&pellentesque=volutpat&viverra=quam&pede=pede&ac=lobortis&diam=ligula&cras=sit&pellentesque=amet&volutpat=eleifend&dui=pede&maecenas=libero&tristique=quis&est=orci&et=nullam&tempus=molestie&semper=nibh&est=in&quam=lectus&pharetra=pellentesque&magna=at&ac=nulla&consequat=suspendisse&metus=potenti&sapien=cras&ut=in&nunc=purus&vestibulum=eu&ante=magna&ipsum=vulputate&primis=luctus&in=cum&faucibus=sociis&orci=natoque&luctus=penatibus&et=et&ultrices=magnis&posuere=dis&cubilia=parturient&curae=montes&mauris=nascetur&viverra=ridiculus&diam=mus&vitae=vivamus&quam=vestibulum&suspendisse=sagittis&potenti=sapien&nullam=cum&porttitor=sociis&lacus=natoque&at=penatibus&turpis=et&donec=magnis&posuere=dis&metus=parturient&vitae=montes&ipsum=nascetur&aliquam=ridiculus&non=mus&mauris=etiam&morbi=vel&non=augue&lectus=vestibulum&aliquam=rutrum&sit=rutrum&amet=neque&diam=aenean&in=auctor&magna=gravida","is_business":false,"counts":{"media":475,"follows":961,"followed_by":931}},
											{"id":"6070945948","username":"bredfearnh","full_name":"Brock Redfearn","profile_picture":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAADCSURBVCjPvdCxCcMwEAXQAxcuIoIFAUMgqtypcyXSqBIYNy4M0gSZQBNoAm2QCW6DTOBFbg1HTo6QyqW5QsU9vj4HK+wPHAJ88uhxDiuMwaFFk/qksUOF7cAJnmb8+rKmFXiN8sxgpomBwb6A7qUe7e2vw0Tj4qKNJvaLLkDRhRoS+QdGcpxQwml7pRaxpiowcGQZdHilVssoyu9VhsjAkmGgsCEZT1Rv/RHuH2BTqYa6xKlQmqPIda6ekGA47tT78wZ72Oy4vOPLEgAAAABJRU5ErkJggg==","bio":"Bipolar disord, crnt epsd depress, mild or mod severt, unsp","website":"http://tamu.edu/non/mauris/morbi/non/lectus.jsp?donec=pede&ut=justo&dolor=lacinia&morbi=eget&vel=tincidunt&lectus=eget&in=tempus&quam=vel&fringilla=pede&rhoncus=morbi&mauris=porttitor&enim=lorem&leo=id&rhoncus=ligula&sed=suspendisse&vestibulum=ornare&sit=consequat&amet=lectus&cursus=in&id=est&turpis=risus&integer=auctor&aliquet=sed&massa=tristique&id=in&lobortis=tempus&convallis=sit&tortor=amet&risus=sem&dapibus=fusce&augue=consequat&vel=nulla&accumsan=nisl&tellus=nunc&nisi=nisl&eu=duis&orci=bibendum&mauris=felis&lacinia=sed&sapien=interdum&quis=venenatis&libero=turpis&nullam=enim&sit=blandit&amet=mi&turpis=in&elementum=porttitor&ligula=pede&vehicula=justo&consequat=eu&morbi=massa&a=donec&ipsum=dapibus&integer=duis&a=at&nibh=velit&in=eu&quis=est&justo=congue&maecenas=elementum&rhoncus=in&aliquam=hac&lacus=habitasse&morbi=platea&quis=dictumst&tortor=morbi&id=vestibulum&nulla=velit&ultrices=id&aliquet=pretium&maecenas=iaculis&leo=diam&odio=erat&condimentum=fermentum&id=justo&luctus=nec&nec=condimentum&molestie=neque&sed=sapien&justo=placerat&pellentesque=ante&viverra=nulla&pede=justo&ac=aliquam&diam=quis&cras=turpis&pellentesque=eget&volutpat=elit&dui=sodales&maecenas=scelerisque&tristique=mauris&est=sit&et=amet&tempus=eros&semper=suspendisse&est=accumsan&quam=tortor","is_business":false,"counts":{"media":448,"follows":173,"followed_by":353}},
											{"id":"4891487631","username":"fstudderti","full_name":"Freeman Studdert","profile_picture":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAJ5SURBVDjLpZPNS1RhFMaff2EWLWo5tGnRaqCFRBAM0cZFwVSQpVHNQAWVMQwaSSZWtimLiKnsO5lEjKzs4y1zRK3oItfMj1FnnJkaUtNrjo45H3eejpCKNa5anMX73vs855zfOS9I4n9i2SHbCpvph8q8A9PNcCzcz76EM9EETj+DmmqENaeBiJ3mRyuzQy5mwyVMKqiFbzNN0MxgKZOd2zj5GMZE/ZL5ooHZAntGW89s7Bw5Ws25llWcfQHrzHPYE/51ZOQ0M4Fiitj4UQdbzhZSb+FJ63ZypJqp7p0UsTf+FN6kvoMMl3GmNY9jj+BckcF8/HoFldLzpZIqxhthJPVdkr2cifdb5sXefyAKLFvyzVJJAssisIxstILZ0DEyeJzpHifHfNBGamFZ+C9yC7bhG7BBxCrZZqWQpoiNP6S1TMBFDh4gA0VMdxfy+0NosftQX+8gGKkBY741HLoGhbnXUOZwKTn+gGa4nOlBN9MDxdJzCTmwj+wvEKPDTPUc5Zx+kOk+NxmqZOJTIXsviYGQVgKLAos/n0CbbIAS0ir1eY9kF4O+3UzpBYzehhaugQpdR3DwKth7EeyqEoO/oYzXwyKwDDN0ipme/VKFi0l9L8M3oYW8SwxWnIKI1XT7Vqb6i/ntLoLTHdulhROcUJsZuJJjCsvEPpyf8m8io5U0VB6FtFNIe6da84XFEcYaNrDzLDw5DUZ9cEwqm6zxGWYGPBTShogtQtoerV0rLA5JKy5+ubya7SdzbKKMyRG7ByPeIfvebKfAWszUdQFavKOI0bqNbCuF4XfneAvzIaStQrpOxEpIL746rQKOD2VQbSXwtLiXg/wNTNvAOhsl8oEAAAAASUVORK5CYII=","bio":"Charcot's joint, unspecified hip","website":"https://redcross.org/et/eros/vestibulum/ac.html?diam=justo&neque=sit&vestibulum=amet&eget=sapien&vulputate=dignissim&ut=vestibulum&ultrices=vestibulum&vel=ante&augue=ipsum&vestibulum=primis&ante=in&ipsum=faucibus&primis=orci&in=luctus&faucibus=et&orci=ultrices&luctus=posuere&et=cubilia&ultrices=curae&posuere=nulla&cubilia=dapibus&curae=dolor&donec=vel&pharetra=est&magna=donec&vestibulum=odio&aliquet=justo&ultrices=sollicitudin&erat=ut&tortor=suscipit&sollicitudin=a&mi=feugiat&sit=et&amet=eros&lobortis=vestibulum&sapien=ac&sapien=est&non=lacinia&mi=nisi&integer=venenatis&ac=tristique&neque=fusce&duis=congue&bibendum=diam&morbi=id&non=ornare&quam=imperdiet&nec=sapien&dui=urna&luctus=pretium&rutrum=nisl&nulla=ut&tellus=volutpat&in=sapien&sagittis=arcu&dui=sed","is_business":true,"counts":{"media":406,"follows":588,"followed_by":813}},
											{"id":"6276865737","username":"afrenchumj","full_name":"Annora Frenchum","profile_picture":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAADPSURBVCjPdZFNCsIwEEZHPYdSz1DaHsMzuPM6RRcewSO4caPQ3sBDKCK02p+08DmZtGkKlQ+GhHm8MBmiFQUU2ng0B7khClTdQqdBiX1Ma1qMgbDlxh0XnJHiit2JNq5HgAo3KEx7BFAM/PMI0CDB2KNvh1gjHZBi8OR448GnAkeNDEDvKZDh2Xl4cBcwtcKXkZdYLJBYwCCFPDRpMEjNyKcDPC4RbXuPiWKkNABPOuNhItegz0pGFkD+y3p0s48DDB43dU7+eLWes3gdn5Y/LD9Y6skuWXcAAAAASUVORK5CYII=","bio":"Rheu arthritis of r elbow w involv of organs and systems","website":"http://biblegateway.com/commodo/placerat/praesent/blandit/nam.js?enim=sed&lorem=tristique&ipsum=in&dolor=tempus&sit=sit&amet=amet&consectetuer=sem&adipiscing=fusce&elit=consequat&proin=nulla&interdum=nisl&mauris=nunc&non=nisl&ligula=duis&pellentesque=bibendum&ultrices=felis&phasellus=sed&id=interdum&sapien=venenatis&in=turpis&sapien=enim&iaculis=blandit&congue=mi&vivamus=in&metus=porttitor&arcu=pede&adipiscing=justo&molestie=eu&hendrerit=massa&at=donec&vulputate=dapibus&vitae=duis&nisl=at&aenean=velit&lectus=eu&pellentesque=est&eget=congue&nunc=elementum&donec=in&quis=hac&orci=habitasse&eget=platea&orci=dictumst&vehicula=morbi&condimentum=vestibulum&curabitur=velit&in=id&libero=pretium&ut=iaculis&massa=diam&volutpat=erat&convallis=fermentum&morbi=justo&odio=nec&odio=condimentum&elementum=neque&eu=sapien&interdum=placerat&eu=ante&tincidunt=nulla&in=justo&leo=aliquam&maecenas=quis&pulvinar=turpis&lobortis=eget&est=elit&phasellus=sodales&sit=scelerisque&amet=mauris&erat=sit&nulla=amet&tempus=eros&vivamus=suspendisse&in=accumsan","is_business":false,"counts":{"media":402,"follows":408,"followed_by":388}}
											];



public activityObj = {
  "title": "Poem Marathon",
  "description": "How do we create awareness for any social issues or natural disaster?? One favourite and mostly common thing which we do is Marathon. We can’t do running or walking to conduct an external marathon as we are QUARANTINED! However, we are allowed to WRITE! So we can freely do a Writing Marathon",
  "start_date_time": "2020-04-21 19:14:10",
  "end_date_time": "2020-04-21 19:14:10",
  "category": "Parenting",
  "id": "a9800285229",
  "type": "monthly",
  "credits": 50,
  "external_link": "https://high4teens.in/link/diam/in/magna/bibendum.png",
  "media": {
    "low_resolution": {
      "url": "http://dummyimage.com/512x512.bmp/cc0000/ffffff",
      "width": 512,
      "height": 512
    },
    "thumbnail": {
      "url": "http://dummyimage.com/256x256.png/dddddd/000000",
      "width": 256,
      "height": 256
    },
    "standard_resolution": {
      "url": "http://dummyimage.com/794x1024.jpg/5fa2dd/ffffff",
      "width": 1024,
      "height": 1024
    }
  },
  "tags": [
    "monthly",
    "threads",
    "forums"
  ],
  "location": {
    "type": "offline",
    "latitude": 7.8715342,
    "longitude": 5.0728823,
    "country": "IN",
    "street_address": "RM Colony",
    "name": "Chennai"
  },
  "participants": [
    {
      "count": 12,
      "username": "gsthina1",
      "full_name": "G Surendar Thina",
      "profile_picture": "http://dummyimage.com/256x256.jpg/cc0000/ffffff",
      "id": "9367074271"
    },
    {
      "username": "gsthina2",
      "full_name": "G Surendar Thina",
      "profile_picture": "http://dummyimage.com/256x256.jpg/cc0000/ffffff",
      "id": "9367074272"
    }
  ],
  "rating": {
    "count": 52,
    "list": [
      {
        "created_time": "2019-07-31 19:14:10",
        "value": "5",
        "from": {
          "username": "gsthina",
          "full_name": "G Surendar Thina",
          "id": "u9367074271"
        },
        "type": "scale"
      },
      {
        "created_time": "2019-07-31 19:14:10",
        "value": "3",
        "from": {
          "username": "gsthina",
          "full_name": "G Surendar Thina",
          "id": "u9367074271"
        },
        "type": "scale"
      }
    ]
  },
  "feedback": {
    "count": 65,
    "list": [
      {
        "created_time": "2019-07-31 19:14:10",
        "text": "Reposition Abdominal Aorta, Percutaneous Endoscopic Approach",
        "from": {
          "username": "gsthina",
          "full_name": "G Surendar Thina",
          "profile_picture": "http://dummyimage.com/256x256.jpg/cc0000/ffffff",
          "type": "text",
          "id": "9367074271"
        },
        "id": "f9800285229",
        "type": "improvement/report"
      }
    ]
  },
  "created_time": "2019-07-31 19:14:10"
}

public postObject = {
  "comments": {
    "count": 73,
    "list": [
      {
        "created_time": "2019-07-31 19:14:10",
        "text": "Reposition Abdominal Aorta, Percutaneous Endoscopic Approach",
        "from": {
          "username": "gsthina",
          "full_name": "G Surendar Thina",
          "profile_picture": "http://dummyimage.com/256x256.jpg/cc0000/ffffff",
          "type": "text",
          "id": "9367074271"
        },
        "id": "c9800285229",
        "type": "text",
        "votes": [
          {
            "username": "gsthina1",
            "full_name": "G Surendar Thina",
            "profile_picture": "http://dummyimage.com/256x256.jpg/cc0000/ffffff",
            "type": "up",
            "id": "9367074271"
          },
          {
            "username": "gsthina2",
            "full_name": "G Surendar Thina",
            "profile_picture": "http://dummyimage.com/256x256.jpg/cc0000/ffffff",
            "type": "down",
            "id": "9367074272"
          }
        ]
      }
    ]
  },
  "rating": {
    "count": 52,
    "list": [
      {
        "created_time": "2019-07-31 19:14:10",
        "value": "5",
        "from": {
          "username": "gsthina",
          "full_name": "G Surendar Thina",
          "id": "9367074271"
        },
        "type": "scale"
      },
      {
        "created_time": "2019-07-31 19:14:10",
        "value": "5",
        "from": {
          "username": "gsthina",
          "full_name": "G Surendar Thina",
          "id": "9367074271"
        },
        "type": "scale"
      }
    ]
  },
  "external_link": "https://high4teens.in/link/diam/in/magna/bibendum.png",
  "user": {
    "username": "gsthina",
    "profile_picture": "http://dummyimage.com/256x256.jpg/cc0000/ffffff",
    "id": "3582899632"
  },
  "media": {
    "low_resolution": {
      "url": "http://dummyimage.com/512x512.bmp/cc0000/ffffff",
      "width": 512,
      "height": 512
    },
    "thumbnail": {
      "url": "http://dummyimage.com/256x256.png/dddddd/000000",
      "width": 256,
      "height": 256
    },
    "standard_resolution": {
      "url": "http://dummyimage.com/794x1024.jpg/5fa2dd/ffffff",
      "width": 1024,
      "height": 1024
    }
  },
  "type": "image/png",
  "tags": [
    "kids",
    "motivation",
    "mindset"
  ],
  "id": "p6839349160",
  "location": {
    "latitude": 7.8715342,
    "longitude": 5.0728823,
    "country": "IN",
    "street_address": "RM Colony",
    "name": "Chennai"
  },
  "category": "Parenting",
  "title": "State Witness, The (Swiadek koronny)",
  "description": {
    "content": "Nondisplaced other extraarticular fracture of unspecified calcaneus"
  },
  "created_datetime": "2019-07-31 19:14:10"
};


  public activities:any = [
											{
  "title": "Poem Marathon",
  "description": "How do we create awareness for any social issues or natural disaster?? One favourite and mostly common thing which we do is Marathon. We can’t do running or walking to conduct an external marathon as we are QUARANTINED! However, we are allowed to WRITE! So we can freely do a Writing Marathon",
  "start_date_time": "2020-04-21 19:14:10",
  "end_date_time": "2020-04-21 19:14:10",
  "category": "Parenting",
  "id": "a9800285229",
  "type": "monthly",
  "credits": 50,
  "external_link": "https://high4teens.in/link/diam/in/magna/bibendum.png",
  "media": {
    "low_resolution": {
      "url": "http://dummyimage.com/512x512.bmp/cc0000/ffffff",
      "width": 512,
      "height": 512
    },
    "thumbnail": {
      "url": "http://dummyimage.com/256x256.png/dddddd/000000",
      "width": 256,
      "height": 256
    },
    "standard_resolution": {
      "url": "http://dummyimage.com/794x1024.jpg/5fa2dd/ffffff",
      "width": 1024,
      "height": 1024
    }
  },
  "tags": [
    "monthly",
    "threads",
    "forums"
  ],
  "location": {
    "type": "offline",
    "latitude": 7.8715342,
    "longitude": 5.0728823,
    "country": "IN",
    "street_address": "RM Colony",
    "name": "Chennai"
  },
  "participants": [
    {
      "count": 12,
      "username": "gsthina1",
      "full_name": "G Surendar Thina",
      "profile_picture": "http://dummyimage.com/256x256.jpg/cc0000/ffffff",
      "id": "9367074271"
    },
    {
      "username": "gsthina2",
      "full_name": "G Surendar Thina",
      "profile_picture": "http://dummyimage.com/256x256.jpg/cc0000/ffffff",
      "id": "9367074272"
    }
  ],
  "rating": {
    "count": 52,
    "list": [
      {
        "created_time": "2019-07-31 19:14:10",
        "value": "5",
        "from": {
          "username": "gsthina",
          "full_name": "G Surendar Thina",
          "id": "u9367074271"
        },
        "type": "scale"
      },
      {
        "created_time": "2019-07-31 19:14:10",
        "value": "3",
        "from": {
          "username": "gsthina",
          "full_name": "G Surendar Thina",
          "id": "u9367074271"
        },
        "type": "scale"
      }
    ]
  },
  "feedback": {
    "count": 65,
    "list": [
      {
        "created_time": "2019-07-31 19:14:10",
        "text": "Reposition Abdominal Aorta, Percutaneous Endoscopic Approach",
        "from": {
          "username": "gsthina",
          "full_name": "G Surendar Thina",
          "profile_picture": "http://dummyimage.com/256x256.jpg/cc0000/ffffff",
          "type": "text",
          "id": "9367074271"
        },
        "id": "f9800285229",
        "type": "improvement/report"
      }
    ]
  },
  "created_time": "2019-07-31 19:14:10"
}
											];



}
