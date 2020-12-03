import { Injectable } from '@angular/core';

// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
import * as firebase from "firebase/app";

// Add the Firebase services that you want to use
import "firebase/auth";
import "firebase/firestore";
import "firebase/messaging";

import { FIREBASE_CONFIG } from '../../environments/environment';

import { UtilService } from './util.service';

declare var window:any;

@Injectable({
  providedIn: 'root'
})

export class FirebaseService {

  constructor(
    private util: UtilService
  ) { }

  initialize(){

    // // TODO: Replace the following with your app's Firebase project configuration
    var firebaseConfig = FIREBASE_CONFIG;
    //
    // // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    firebase.auth().useDeviceLanguage(); // OTP PhoneNumber

    //
    // // Retrieve Firebase Messaging object.
    // const messaging = firebase.messaging();
    // // Add the public key generated from the console here.
    // messaging.usePublicVapidKey("BHwhM5nXqrQUFUFmtpwZCUullyanNvKUhDXfV9yaItek9Guip2cwB702djawZsNHxpKVp9wBE9anfu3b52KebG8");
    //
    console.log("Firebase Initialized: ", firebase);
  }

  sendOTP(phone){
    return new Promise((resolve, reject)=>{
      window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        'size': 'normal',
        'callback': function(response) {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          console.log("reCAPTCHA solved, allow signInWithPhoneNumber.");
          console.log(phone, response);
          firebase.auth().signInWithPhoneNumber('+91'+phone,window.recaptchaVerifier).then((confirmationResult)=>{
            window.confirmationResult = confirmationResult;
            resolve(true);
          }).catch(error => console.log(error));
        },
        'expired-callback': function() {
          // Response expired. Ask user to solve reCAPTCHA again.
          console.log("Response expired. Ask user to solve reCAPTCHA again.");
          reject(false);
        }
      });
      window.recaptchaVerifier.render();
    });
  }

  // sendOTP(phone){
  //   firebase.auth().signInWithPhoneNumber('+91'+phone,window.recaptchaVerifier).then((confirmationResult)=>{
  //     window.confirmationResult = confirmationResult;
  //   }).catch(error => console.log(error));
  // }

  validateOTP(otp){
    return new Promise((resolve, reject)=>{
      window.confirmationResult.confirm(otp).then(result =>{
        console.log(result);
        resolve(true);
      }).catch(error => {
        console.log("Incorrect: ", error);
        reject(false);
      });
    });
  }

  sendEmailLink(email, resetUrl){
    console.log("Email link sent with URL: ", resetUrl);
    var actionCodeSettings = {
      // URL you want to redirect back to. The domain (www.example.com) for this
      // URL must be whitelisted in the Firebase Console.
      url: resetUrl,
      // This must be true.
      handleCodeInApp: true,
      dynamicLinkDomain: 'learngst.page.link'
    };

    return new Promise((resolve, reject)=>{
      firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings).then(function() {
          // The link was successfully sent. Inform the user.
          // Save the email locally so you don't need to ask the user for it again
          // if they open the link on the same device.
          console.log(email);
          resolve(true);
          // window.localStorage.setItem('emailForSignIn', email);
        }).catch(function(error) {
          console.log(error);
          reject(error);
          // Some error occurred, you can inspect the code: error.code
        });
    });

  }



}
