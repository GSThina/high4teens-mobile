import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

import { Router } from '@angular/router';

import { environment, SERVER_URL } from '../../environments/environment';

import { DatabaseService } from './database.service';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private headeroptions:any = {};

  public token:any = "";

  constructor(
    private db: DatabaseService,
    private util: UtilService,
    private http: HttpClient,
    private router: Router
  ) {
  	console.log("Connecting to... ", SERVER_URL);
    this.initialize();
  }

  setToken(token){
    this.token = token;
  }

  getToken(){
    return (this.token=="")?null:this.token;
  }

  initialize(){


     // return new Promise((resolve, reject)=>{
     // 		this.db.confirmConnection().then(conn=>{
     // 			(conn)?resolve(conn):reject(conn);
     // 		});
     // 	});

     // const host = `http://localhost:5000/weather`;
     // return this.httpClient.get<IApiResponse<IWeather>>(host, options)
  }
  //
  // getHeader(url, payload){
  //   // return new Promise((resolve, reject)=>{
  //     this.util.getFromStorage('token').then((val:any)=>{
  //     const token = val;
  //     if (!token) {
  //        setTimeout(() => this.router.navigateByUrl('/login'), 3000);
  //        return "Not working";
  //      } else {
  //         let option:any = {
  //           headers: new HttpHeaders({
  //             'Content-Type':  'application/json',
  //             'Authorization': token
  //           })
  //         };
  //         this.headeroptions = (url!='loginUser')?option:{};
  //         // resolve(options);
  //         console.log(url, this.headeroptions);
  //      }
  //    });
  //  // });
  // }

  post(url, payload){
    console.log(url, payload);
    return this.http.post(SERVER_URL + url, payload, {
      headers: new HttpHeaders().set('Authorization', this.token)
    });
  }

  put(url, payload){
    console.log(url, payload);
    return this.http.put(SERVER_URL + url, payload, {
      headers: new HttpHeaders().set('Authorization', this.token)
    });
  }

  get(url){
    return this.http.get(SERVER_URL + url, {
      headers: new HttpHeaders().set('Authorization', this.token)
    });
  }

  delete(url, payload){
    console.log(url, payload, this.token);
    return this.http.delete(SERVER_URL + url + payload, {
      headers: new HttpHeaders().set('Authorization', this.token)
    });
  }

  // delete(url, payload){
  //   console.log(this.token);
  //   return new Promise((resolve, reject) => {
  //   		this.http.request('delete', url, payload, {
  //         headers: new HttpHeaders().set('Authorization', this.token)
  //       }).subscribe(res => {
  //   			resolve(res);
  //   		},err => {
  //   			reject(err);
  //   		});
  //   });
  // }


  //
  // // Create a new item
  // createItem(item): Observable<Student> {
  //   return this.http
  //     .post<Student>(this.base_path, JSON.stringify(item), this.httpOptions)
  //     .pipe(
  //       retry(2),
  //       catchError(this.handleError)
  //     )
  // }
  //
  // // Get single student data by ID
  // getItem(id): Observable<Student> {
  //   return this.http
  //     .get<Student>(this.base_path + '/' + id)
  //     .pipe(
  //       retry(2),
  //       catchError(this.handleError)
  //     )
  // }
  //
  // // Get students data
  // getList(): Observable<Student> {
  //   return this.http
  //     .get<Student>(this.base_path)
  //     .pipe(
  //       retry(2),
  //       catchError(this.handleError)
  //     )
  // }
  //
  // // Update item by id
  // updateItem(id, item): Observable<Student> {
  //   return this.http
  //     .put<Student>(this.base_path + '/' + id, JSON.stringify(item), this.httpOptions)
  //     .pipe(
  //       retry(2),
  //       catchError(this.handleError)
  //     )
  // }
  //
  // // Delete item by id
  // deleteItem(id) {
  //   return this.http
  //     .delete<Student>(this.base_path + '/' + id, this.httpOptions)
  //     .pipe(
  //       retry(2),
  //       catchError(this.handleError)
  //     )
  // }

}



  /*
    /getAllActivities
    /getActivityDetailsById
    /addCommentByActivityId
    /getAllCommentsByActivityId
    /updateVote
    /incrementViewsByPostId
    /getAllCommentsByPostId
    /getAllFansByUserId
    /getAllBadgesByUserId
    /getAllStatsByUserId
  */
