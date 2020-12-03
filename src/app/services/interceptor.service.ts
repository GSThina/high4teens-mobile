import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { from } from 'rxjs';

// import { _throw } from 'rxjs/observable/throw';
import { catchError, mergeMap } from 'rxjs/operators';

import { Storage } from '@ionic/storage';

import { UtilService } from "./util.service";

@Injectable({
  providedIn: 'root'
})
export class InterceptorService {

  constructor(private util: UtilService, private storage: Storage) {

  }
  // intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
  //   let promise = this.util.getFromStorage('token');
  //
  //   // return Observable.fromPromise(promise)
  //
  //
  //   // return new Promise((resolve, reject)=>{
  //   //   this.storage.get('token').then((token) => {
  //   //     // console.log("UtilService: getFromStorage() : " + token);
  //   //     let clonedReq = this.addToken(request, token);
  //   //     console.log(clonedReq);
  //   //     return next.handle(clonedReq).pipe(
  //   //       catchError(error => {
  //   //         console.log("Error: ", error);
  //   //       })
  //   //     );
  //   //   });
  //   // });
  //
  //   // return this.util.getFromStorage('token')
  //   // .mergeMap(token => {
  //   //   let clonedReq = this.addToken(request, token);
  //   //   return next.handle(clonedReq).pipe(
  //   //     catchError(error => {
  //   //       console.log("Error: ", error);
  //   //     })
  //   //   );
  //   // });
  // }
  //
  // private addToken(request: HttpRequest<any>, token: any){
  //   let clone: HttpRequest<any>;
  //   if(token){
  //     clone = request.clone({
  //       setHeaders: {
  //         "Accept": 'application/json',
  //         "Content-Type": 'application/json',
  //         "Authorization": `Bearer ${token}`
  //       }
  //     });
  //     return clone;
  //   }
  //   return clone;
  // }
}
