import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';

import { PostDetailComponent } from '../../components/post-detail/post-detail.component';
import { ProfileComponent } from '../../components/profile/profile.component';
import { NetworkService 	} from '../../services/network.service';
import { UtilService } from "../../services/util.service";
import { DataService } from "../../services/data.service";
import { UserService } from "../../services/user.service";

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss']
})
export class SearchPage implements OnInit {

  public options:any = this.nav.get('data');

  public isSearchDirty:boolean = false;

  constructor(
    public util: UtilService,
    private nav: NavParams,
    public dataService:DataService,
    public userService: UserService,
    public networkService: NetworkService
  ) { }

  ngOnInit() {
  }

  searchAuthor(ev?:any){
    //console.log("inside the searchAuthor function: ",ev.target.value);
    let searchData = { full_name:ev };
    console.log("searchdata: ",searchData);
    this.dataService.getUserDetailsByName(searchData).then((value:any)=>{
      this.options.listItems = (value.status!=400)?value:[];
      console.log("Here are the list authors: ",value);
    })
  }

  searchPosts(ev?:any){
    console.log("inside the searchpost function: ",ev);
    let searchData = {title:ev};
    this.dataService.getPostsByTitle(searchData).then((value:any)=>{
      this.options.listItems = (value.status!=400)?value:[];
      console.log("Here are the posts you asked for: ",value);
    })
  }

  public searchType:string="all";
  setSearchType(ev?:any){
   console.log("inside setSearchType function: ",ev);

   this.options.listItems = [];
   this.searchQuery = "";
   this.isSearchDirty = false;
   this.searchType = ev.target.value.toString();
  }

  public searchQuery:string="";

  setSearchQuery(ev?:any){
   console.log("inside the searchQuery function: ",ev);
   this.searchQuery = ev.target.value.toString();
   this.searchFunction(this.searchQuery);
   this.isSearchDirty = true;
  }

  searchFunction(query){
    if(this.searchType.localeCompare('authors')==0) {
      this.searchAuthor(query);
    }
    else if(this.searchType.localeCompare('posts')==0){
      this.searchPosts(query);
    }
    else{
      console.log("Search all is not implemented currently");
    }
  }

  openProfilePage(item){
    console.log("inside openProfilePage: ",item);
    this.util.presentModal(ProfileComponent,item,'ProfileComponent',false);
  }


  openPostDetail(item){
    console.log("inside openPostDetials: ",item);
    this.util.presentModal(PostDetailComponent,item,'PostDetailComponent',false);
  }

  dropDownOptions(ev: any){
    let payload = {
      isList:true,
      listItems:[
      //isSearch:true,
      {
        text:"Authors",
        handler:"searchAuthor"
      },
      {
        text:"Posts",
        handler:"searchPosts"
      }
     ]
    }
    this.util.presentPopover(ev,SearchPage,payload)
  }

}
