import { Component, OnInit } from '@angular/core';

import { ActivityService } from '../../services/activity.service';
import { DataService } from'../../services/data.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-filter-modal',
  templateUrl: './filter-modal.component.html',
  styleUrls: ['./filter-modal.component.scss'],
})
export class FilterModalComponent implements OnInit {

  constructor(
    public activityService: ActivityService,
    public dataService: DataService
  ) { }

  ngOnInit() {
    console.log("inside ngOnInit of filtersmodalpage:");
    console.log("activity Services logs: ",this.activityService.activitiesList);
    console.log("data Services logs: ",this.dataService);
  }

  sortFunction(ev: any){
    console.log("inside the sortByLatestDate function: ",ev.detail.value);
    //Ascending
    if(ev.detail.value.localeCompare('sortDateOldest')==0){
      console.log("Sorting By Latest Date");
      return this.activityService.activitiesList.sort((a: { created_time: string | number | Date; },b: { created_time: string | number | Date; })=>{
        return <any>new Date(b.created_time) - <any>new Date(a.created_time);
      })
    }
    //Descending
    else if(ev.detail.value.localeCompare('sortDateLatest')==0){
      console.log("Sorting By Oldest Date");
      return this.activityService.activitiesList.sort((a: { created_time: string | number | Date; },b: { created_time: string | number | Date; })=>{
        return <any>new Date(a.created_time) - <any>new Date(b.created_time);
      })
    }
    else{
      console.log("Sorting By Credits");
      return this.activityService.activitiesList.sort((a,b)=>{
        return b.credits - a.credits;
      })
    }
  }

  checkFilteredArray(result){
    if(result[0] == undefined){
      console.log("Oops there is no activity with the applied filters");
      return null;
    }
    else{
      return result
    }
  }

  filterFunctionByCategory(ev: any){
    console.log("inside the filterbycategory function: ",ev.detail.value);
    this.activityService.activitiesList = this.activityService.tempActivityList;
    this.activityService.activitiesList = this.activityService.activitiesList.filter(function(activity){
      return activity.category == ev.detail.value;
    });
    console.log("This is the filtered array: ",this.activityService.activitiesList[0]);
    this.checkFilteredArray(this.activityService.activitiesList);

    /*if(ev.detail.value.localeCompare('General')==0){
      console.log("Filtering By Category: General");
      this.activityService.activitiesList = this.activityService.activitiesList.filter(function(activity){
        return activity.category == ev.detail.value;
      });
      console.log("This is the filtered array: ",this.activityService.activitiesList[0]);
      this.checkFilteredArray(this.activityService.activitiesList)
      //return this.activityService;
    }
    else if(ev.detail.value.localeCompare('Kids')==0){
      console.log("Filtering By Category: Kids");
      this.activityService.activitiesList = this.activityService.activitiesList.filter(function(activity){
        return activity.category == ev.detail.value;
      });
      console.log("This is the filtered array: ",this.activityService.activitiesList[0]);
      this.checkFilteredArray(this.activityService.activitiesList)
      //return this.activityService;
    }
    else if(ev.detail.value.localeCompare('Education')==0){
      console.log("Filtering By Category: Education");
      this.activityService.activitiesList = this.activityService.activitiesList.filter(function(activity){
        return activity.category == ev.detail.value;
      });
      console.log("This is the filtered array: ",this.activityService.activitiesList[0]);
      this.checkFilteredArray(this.activityService.activitiesList)
      //return this.activityService;
    }
    else if(ev.detail.value.localeCompare('Teenage')==0){
      console.log("Filtering By Category: Teenage");
      this.activityService.activitiesList = this.activityService.activitiesList.filter(function(activity){
        return activity.category == ev.detail.value;
      });
      console.log("This is the filtered array: ",this.activityService.activitiesList[0]);
      this.checkFilteredArray(this.activityService.activitiesList)
      //return this.activityService;
    }
    else if(ev.detail.value.localeCompare('Adult')==0){
      console.log("Filtering By Category: Adult");
      this.activityService.activitiesList = this.activityService.activitiesList.filter(function(activity){
        return activity.category == ev.detail.value;
      });
      console.log("This is the filtered array: ",this.activityService.activitiesList[0]);
      this.checkFilteredArray(this.activityService.activitiesList)
      //return this.activityService;
    }
    else if(ev.detail.value.localeCompare('Marriage')==0){
      console.log("Filtering By Category: Marriage");
      this.activityService.activitiesList = this.activityService.activitiesList.filter(function(activity){
        return activity.category == ev.detail.value;
      });
      console.log("This is the filtered array: ",this.activityService.activitiesList[0]);
      this.checkFilteredArray(this.activityService.activitiesList)
      //return this.activityService;
    }
    else if(ev.detail.value.localeCompare('Parenting')==0){
      console.log("Filtering By Category: Parenting");
      this.activityService.activitiesList = this.activityService.activitiesList.filter(function(activity){
        return activity.category == ev.detail.value;
      });
      console.log("This is the filtered array: ",this.activityService.activitiesList[0]);
      this.checkFilteredArray(this.activityService.activitiesList)
      //return this.activityService;
    }
    else if(ev.detail.value.localeCompare('Grand')==0){
      console.log("Filtering By Category: Grand");
      this.activityService.activitiesList = this.activityService.activitiesList.filter(function(activity){
        return activity.category == ev.detail.value;
      });
      console.log("This is the filtered array: ",this.activityService.activitiesList[0]);
      this.checkFilteredArray(this.activityService.activitiesList)
      //return this.activityService;
    }
    else if(ev.detail.value.localeCompare('Dark')==0){
      console.log("Filtering By Category: Dark");
      this.activityService.activitiesList = this.activityService.activitiesList.filter(function(activity){
        return activity.category == ev.detail.value;
      });
      console.log("This is the filtered array: ",this.activityService.activitiesList[0]);
      this.checkFilteredArray(this.activityService.activitiesList)
      //return this.activityService;
    }*/
  }

  filterFunctionByType(ev: any){
    console.log("Inside the filterbytype function: ",ev);
    this.activityService.activitiesList = this.activityService.tempActivityList;
    this.activityService.activitiesList = this.activityService.activitiesList.filter(function(activity){
      return activity.type == ev.detail.value;
    });
    console.log("The filtered array is: ",this.activityService.activitiesList);
    this.checkFilteredArray(this.activityService.activitiesList);
  }

}
