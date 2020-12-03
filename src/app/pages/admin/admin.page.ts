import { Component, ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage {

  @ViewChild(IonInfiniteScroll ,{ static:true}) infiniteScroll: IonInfiniteScroll;
  @ViewChild('feed') feed: any;


  constructor() {}

  ngOnInit() {

  }

  addNewBadge(){
    console.log("AdminPage :: addNewBadge()");
  }

  resetBadgeForm(){
    console.log("AdminPage :: resetBadgeForm()");
  }

  // loadData(event) {
  //   setTimeout(() => {
  //     console.log('Done');
  //     event.target.complete();
  //
  //   //   // App logic to determine if all data is loaded
  //   //   // and disable the infinite scroll
  //   //   if (data.length == 1000) {
  //   //     event.target.disabled = true;
  //   //   }
  //   // }, 500);
  //
  //   })
  // }
  //
  // toggleInfiniteScroll() {
  //   this.infiniteScroll.disabled = !this.infiniteScroll.disabled;
  // }

}
