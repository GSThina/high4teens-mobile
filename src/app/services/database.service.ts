import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor() { }

  initialize(){

  }

  confirmConnection(){
  	return new Promise((resolve, reject)=>{
  		resolve("Connection Successful");
  	});
  }


}
