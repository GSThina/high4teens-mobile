import { Component, OnInit, ViewChild } from '@angular/core';
// import { IonicModule } from '@ionic/angular';

import { DataService  } from '../../services/data.service';
import { UtilService  } from '../../services/util.service';
import { UserService 	} from '../../services/user.service';
import { TimeService 	} from '../../services/time.service';

import * as Chart from 'chart.js';
import * as moment from 'moment';
// let moment = require("moment")

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss'],
})
export class ChartsComponent implements OnInit {

  @ViewChild('categoryChart') categoryChart;
  @ViewChild('postsByMonthChart') postsByMonthChart;
  @ViewChild('postsByCategoryByMonthChart') postsByCategoryByMonthChart;

  charts: any;
  colorArray: any;
  labelArray: any;
  categoryArray: any;

  public nextStreakTime:any;

  constructor(
    public dataService: DataService,
    public timeService: TimeService,
    public util: UtilService,
    public user: UserService
  ) { }

  ngOnInit() {
    console.log("OnInit: ", this.dataService.stages);
  }

  ionViewDidEnter(){
    console.log("Did enter: ", this.dataService.stages);
    this.createCategoryChart();
    this.createPostsByMonthChart();
    this.createPostsByCategoryByMonthChart();
    // this.createStreakChart();
    // this.nextStreakTimeUpdate();
  }

  createCategoryChart() {
    console.log("ChartsComponent :: createCategoryChart()");
    this.generateLegends(this.dataService.stages);
    let categoryChart = new Chart(this.categoryChart.nativeElement, {
      type: 'radar',
      data: {
        labels: this.labelArray,//['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'],
        datasets: [{
          label: 'Posts',
          data: this.categoryArray,//,[2.5, 3.8, 5, 6.9, 6.9, 7.5, 10, 17],
          backgroundColor: 'rgb(221, 42, 39, 0.5)',//'rgb(38, 194, 129, 0.5)',
          // backgroundColor: this.colorArray,//'rgb(38, 194, 129)', // array should have same number of elements as number of dataset
          borderColor: 'rgb(221, 42, 39)',//'rgb(38, 194, 129)',// array should have same number of elements as number of dataset
          borderWidth: 1
        }]
      }
    });
    // this.charts.push(categoryChart);
  }

  createPostsByMonthChart(){
    console.log("ChartsComponent :: createPostsByMonthChart()");

    let postsCreatedTimeArrayLabel:any = [];
    let postsCreatedTimeArray:any = [];
    let postsByMonthArray:any = [];
    let colorArray:any = [];

    postsCreatedTimeArray = this.util.getUniqueByValue(this.user.me.posts, (o1, o2) => moment(o1.created_datetime).format('MMM YYYY') === moment(o2.created_datetime).format('MMM YYYY'));

    for (let i = 0; i < postsCreatedTimeArray.length; i++) {
      postsCreatedTimeArrayLabel.push(moment(postsCreatedTimeArray[i].created_datetime).format('MMM'));
    }

    let array = this.util.getUniqueByValue(this.user.me.posts, (a, b) => moment(a.created_datetime).format('MMM YYYY') === moment(b.created_datetime).format('MMM YYYY'));

    for (let i = 0; i < array.length; i++) {
      const element = array[i];
      console.log(element);
      postsByMonthArray.push(this.user.me.posts.filter(o => moment(o.created_datetime).format('MMM YYYY') === moment(element.created_datetime).format('MMM YYYY')).length);
    }

    colorArray = this.util.generateLightShades(postsByMonthArray.length, 221, 42, 39);

    console.log(postsCreatedTimeArray, postsByMonthArray, colorArray);

    let postsByMonthChart = new Chart(this.postsByMonthChart.nativeElement, {
      type: 'line',
      data: {
        labels: postsCreatedTimeArrayLabel,
        datasets: [{
          label: 'Posts',
          data: postsByMonthArray,
          backgroundColor: colorArray,
          borderColor: colorArray,//'rgb(221, 42, 39)',
          borderWidth: 2,
          fill: false
        }]
      }
    })
  }

  createPostsByCategoryByMonthChart(){

    console.log("ChartsComponent :: createPostsByCategoryByMonthChart()");

    let colorArray = this.util.generateDarkShades(this.dataService.stages.length, 221, 42, 39);
    // let colorArray = ['#de3333', '#7a2a2a', '#4d4d4d', '#7d4646', '#fa6e6e', '#ff0000', '#a30000', '#dd2a27', '#cccccc']
    let categoryArray:any = [];

        let postsByUniqueCreated_datetime:any = [];
        let postsCreatedTimeArrayLabel:any = [];
        let postsCreatedTimeArray:any = [];
        let postsByMonthArray:any = [];
        let labelArray:any = [];

    // by category
    for (let i = 0; i < this.dataService.stages.length; i++) {
      labelArray.push(this.dataService.stages[i].name);

      if(this.user.me.posts!=null){
        categoryArray.push(this.user.me.posts.filter(post => post.category === this.dataService.stages[i].name.toLowerCase()));
      }
    }

    for (let j = 0; j < categoryArray.length; j++) {

      postsCreatedTimeArray[j] = this.util.getUniqueByValue(categoryArray[j], (o1, o2) => moment(o1.created_datetime).format('MMM YYYY') === moment(o2.created_datetime).format('MMM YYYY'));

      // postsCreatedTimeArrayLabel[j] = [];
      //
      // for (let i = 0; i < postsCreatedTimeArray[j].length; i++) {
      //   postsCreatedTimeArrayLabel[j].push(moment(postsCreatedTimeArray[j][i].created_datetime).format('MMM'));
      // }

      postsByUniqueCreated_datetime[j] = this.util.getUniqueByValue(categoryArray[j], (a, b) => moment(a.created_datetime).format('MMM YYYY') === moment(b.created_datetime).format('MMM YYYY'));

      for (let i = 0; i < postsByUniqueCreated_datetime[j].length; i++) {
        const element = postsByUniqueCreated_datetime[j][i];
        console.log(element);
        postsByMonthArray[j] = [];
        for (let k = 0; k < this.timeService.monArray.length; k++) {
          const mon = this.timeService.monArray[k];
          if(mon.toLowerCase() == moment(postsByUniqueCreated_datetime[j][i].created_datetime).format('MMM').toLowerCase()){
            postsByMonthArray[j].push(categoryArray[j].filter(o => moment(o.created_datetime).format('MMM YYYY') === moment(element.created_datetime).format('MMM YYYY')).length);
          } else {
            postsByMonthArray[j].push(0);
          }
        }
      }
    }

    let datasets:any = [];

    for (let i = 0; i < categoryArray.length; i++) {
      datasets.push({
        label: this.dataService.stages[i].name,
        data: postsByMonthArray[i],
        backgroundColor: colorArray[i],
        borderColor: colorArray[i],//'rgb(221, 42, 39)',
        borderWidth: 1,
        fill: false
      });
    }

    let postsByCategoryByMonthChart = new Chart(this.postsByCategoryByMonthChart.nativeElement, {
      type: 'line',
      data: {
        labels: this.timeService.monArray,
        datasets: datasets
      },
      options: {
        scales: {
            xAxes: [{
                stacked: true
            }],
            yAxes: [{
                stacked: true
            }]
          }
        }
    });

    console.log("colorArray: ", colorArray, " :: categoryArray: ", categoryArray, " :: postsByUniqueCreated_datetime: ", postsByUniqueCreated_datetime, " :: postsCreatedTimeArrayLabel: ", postsCreatedTimeArrayLabel, " :: postsCreatedTimeArray: ", postsCreatedTimeArray, " :: postsByMonthArray: ", postsByMonthArray, " :: labelArray: ", labelArray);

  }

  // createStreakChart() {
  //   console.log("ChartsComponent :: createStreakChart()");
  //   this.streakChart = new Chart(this.streakChart.nativeElement, {
  //     type: 'pie',
  //     data: {
  //       labels: ['Streak'],//['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'],
  //       datasets: [{
  //         label: 'Number of Days',
  //         data: [this.user.me.stats.streak],//,[2.5, 3.8, 5, 6.9, 6.9, 7.5, 10, 17],
  //         backgroundColor: 'rgb(38, 194, 129)', // array should have same number of elements as number of dataset
  //         borderColor: 'rgb(38, 194, 129)',// array should have same number of elements as number of dataset
  //         borderWidth: 1
  //       }]
  //     }
  //   });
  // }

  // nextStreakTimeUpdate(){
  //   console.log("ChartsComponent :: nextStreakTimeUpdate() :: moment() :: ", moment().endOf('day').fromNow());
  //   setInterval(function() {
  //     this.nextStreakTime =  moment().endOf('day').fromNow();
  //   }, 1000);
  // }

  generateLegends(array){
    this.labelArray = [];
    this.colorArray = [];
    this.categoryArray = [];
    for (let i = 0; i < array.length; i++) {
      this.labelArray.push(array[i].name);
      if(this.user.me.posts!=null){
        this.categoryArray.push(this.user.me.posts.filter(post => post.category === array[i].name.toLowerCase()).length);
        this.colorArray.push('#' + Math.floor(Math.random() * 16777215).toString(16));
      }
    }
  }

  dismiss() {
    this.util.dismissModal(this);
  }

}
