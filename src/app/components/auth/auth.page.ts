import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';

import { Router } from '@angular/router';

import { ApiService } from "../../services/api.service";
import { UserService } from "../../services/user.service";
import { UtilService } from "../../services/util.service";
import { FirebaseService } from "../../services/firebase.service";
import { APP_VERSION, WEB_APP_URL } from "../../../environments/environment";

import { TabsPage } from "../../tabs/tabs.page";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  public announcement:string = "";

  public isLoginEnable:boolean = false;

  public isShowSignupCard:boolean = false;
  public isShowForgotPassword:boolean = false;
  public isShowEnterOTP:boolean = false;

  public isIdentityExists:boolean = false;

  public isResetPassword:boolean = false;

  public isPhoneExists : boolean = false ;
  public isEmailExists:boolean = false;
  public isUsernameExists:boolean = false;
  // public forgotPassword:any;
  public openLink:any;

  public alternateActionText:string = "Signup";

  public loginDetails:any = {
    identity   : '',
    type       : '',
    password   : ''
  };

//   {
// 	"name":"G Surendar Thina New",
// 	"username":"gsthina1",
// 	"password":"gsthina",
// 	"confirmPassword":"gsthina",
// 	"counts": {
//     "media": "0",
//     "follows": "0",
//     "followed_by": "0",
//     "badges": "0"
//     }
// }

  public signupDetails:any = {
    full_name: '',
    phone    : '',
    username : '',
    email    : '',
    password : ''
  };

  public otp:string="";
  public newPassword:string="";
  public confirmPassword:string="";

  constructor(
    private api:ApiService,
    public user: UserService,
    private util: UtilService,
    private router: Router,
    private platform: Platform,
    private firebaseService: FirebaseService
  ) { }

  ionViewWillEnter(){
    this.user.checkAuthStateToLogin('');
  }

  ngOnInit() {
    this.announcement = APP_VERSION+" | The product is being improved; Thank you!";
  }

  getSuccessful(){

  }

  getFail(){

  }

  forgotPassword(){

    this.isShowForgotPassword = true;
    this.loginDetails.identity = "";
    this.loginDetails.password = "";

    // this.firebaseService.reCAPTCHAVerify().then((isSuccess:any)=>{
    //   if(isSuccess){
    //     this.isShowForgotPassword = true;
    //     this.loginDetails.identity = "";
    //     this.loginDetails.password = "";
    //   }
    // });

  }

  backToLogin(){
    this.isShowForgotPassword=false;
    this.isShowEnterOTP=false;
    this.isResetPassword = false;
  }

  resetPasswordAction(){
    console.log("loginType: ",this.loginDetails.type);
    // this.util.presentLoading('Checking if profile exists...');
    let self = this;
    let isExistURL = (this.loginDetails.type=="phone")?'isPhoneExists':((this.loginDetails.type=="email")?'isEmailExists':null);
    if(isExistURL){
      this.api.post(isExistURL, this.loginDetails).subscribe((data:any)=>{
        if(data.statusCode==200){
          console.log(this.loginDetails.type, " exists");
          if(this.loginDetails.type=="phone"){
            this.firebaseService.sendOTP(this.loginDetails.identity).then((res:any)=>{
              if(res){
                this.isShowEnterOTP = true;
              }
            })
          } else {
            console.log("Creating Custom Token...");
            this.api.post('createCustomToken', {byPassJwt: "098098", email: this.loginDetails.identity, token: self.api.getToken(), expiresIn: 600}).subscribe((response:any)=>{
              console.log("Custom Token Created", response);
              if(response.token!=null){
                let resetUrl = WEB_APP_URL + this.util.encrypt('password?email='+this.loginDetails.identity+'&token='+self.api.getToken()+'&resetToken='+response.token);
                console.info(resetUrl);
                this.util.presentAlert("Verification link generated", "Please click the Signin link to change your password", null, "Awesome!");
                // this.firebaseService.sendEmailLink(this.loginDetails.identity, resetUrl).then((res:any)=>{
                //   if(res){
                //     this.util.presentAlert("Verification link sent", "Please click the Signin link to change your password", null, "Awesome!");
                //   }
                // })
              } else {
                console.warn("Could not get token from server: ", response.text);
              }
            });

          }
        } else if (data.statusCode == 201){
          this.util.presentAlert(null, data.message,null,null);
        } else if (data.statusCode == 400){
          this.util.presentAlert(null, data.message,null,null);
        } else {
          this.util.presentAlert("We're Sorry!", "An unknown Error Occurred",null,null);
        }
        this.util.dismissLoading();
      }, (error:any)=>{
        console.log(error);
        this.util.presentAlert(error.status,error.statusText,null,null);
      });
    } else {
      this.util.presentAlert("Identity is Needed", "Please provide a valid phone or email",null,null);
    }
  }

  verifyOtp(otp){
    this.firebaseService.validateOTP(otp).then(res=>{
      if(res){
        this.isResetPassword = true;
      }
    });
  }

  confirmResetPassword(pass){
    console.log("New Password: ", pass);

    this.api.post('getUserDetailsByPhone', {identity: this.loginDetails.identity,byPassJwt: "098098"}).subscribe((data:any)=>{
      console.log('UserDetailsByPhone: ', data);
      this.api.put('editUserDetailsByUserId', {userid: data[0].userid, password: pass, byPassJwt: "098098"}).subscribe((data:any)=>{
        console.log("Updated Password: response: ", data);
        if(data.status==200){
          this.backToLogin();
        } else {
          console.log("ERROR: ", data);
        }
        this.resetForm('signup');
        this.resetForm('login');
      });
    });
  }

  // setLoginEnable(password){
  //   console.log(this.isLoginEnable);
  //   console.log(this.loginDetails.password!='');
  //   console.log(password);
  //   this.isLoginEnable = (password!='')?true:false;
  // }

  // login(){
  //   console.log(this.loginDetails);
  //   this.loginDetails.type = 'username';
  //   this.util.presentLoading('Logging in with ' + this.loginDetails.type + '...');
  //
  //     this.api.post('loginUser', this.loginDetails).subscribe((data:any)=>{
  //       console.log(data);
  //       let token = (data.token)?data.token:null;
  //       data = (data.status)?data:data.message;
  //       if(data.status==200){
  //         this.util.presentToast('Welcome!', 'Logged in as ' + this.loginDetails.identity, null);
  //         this.user.isLoggedIn = true;
  //         this.user.currentUserId = data.userid;
  //         this.user.setAuthState(true, token);
  //         this.resetForm();
  //         console.log(this.loginDetails);
  //         this.router.navigateByUrl('/');
  //       }else{
  //         this.util.presentToastWithOptions('Hold on!', this.loginDetails.identity + ": " + data.text, null);
  //       }
  //     });
  // }

  resetForm(form){
    // console.log(this.user.currentUserId);
    console.log('Reset: ', form);
    if(form=='signup'){
      console.log('Signup: ', form);
      this.signupDetails = {
        full_name: '',
        phone    : '',
        username : '',
        email    : '',
        password : '',
        role     : 'Community Member'
      };
    } else {
      console.log('Login: ', form);
      this.loginDetails = {
        identity   : '',
        type       : 'username',
        password : ''
      };
    }
    this.otp = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  signup(){
    console.log(this.signupDetails);
    const nameRegex = /^[ a-zA-Z]+$/;
    const phoneRegex = /^\d+$/;
    const emailRegex = /\S+@\S+\.\S+/;

    this.loginDetails.type = (phoneRegex.test(this.signupDetails.identity) && this.signupDetails.identity.length == 10)?"phone":(emailRegex.test(this.signupDetails.identity)?"email":"username");

    if(this.loginDetails.type!="username"){
      this.util.presentLoading('Creating profile for you...');
      if(this.loginDetails.type=="phone"){
        this.signupDetails.phone = this.signupDetails.identity;
      } else if (this.loginDetails.type=="email"){
        this.signupDetails.email = this.signupDetails.identity;
      } else {
        this.util.presentAlert("No Email or Phone!","Then What?",null,null);
      }
      this.api.post('signupUser', this.signupDetails).subscribe((data:any)=>{
        console.log(data);
        this.util.dismissLoading();
        if(data.status == 200){
          this.util.presentToastWithOptions('Thank you, '+this.signupDetails.full_name+'!', 'Login to continue', null);
          this.resetForm('signup');
          // this.router.navigateByUrl('/login');
          this.signupCardToggle();
        }else{
          console.log(this.signupDetails,data.text);
          this.util.presentAlert('It looks like...',data.text,null,"Hold on "+this.signupDetails.full_name+"!");
        }
      }, (error:any)=>{
        console.log(error);
        this.util.presentAlert("Error!!!",error,null,null);
      });
    } else {
      this.util.presentAlert("Validation Oops!","OOOPPS",null,null);
    }
    //
    // let testPhoneRegex = phoneRegex.test(this.signupDetails.phone);
    // let testEmailRegex = emailRegex.test(this.signupDetails.email);
    // let testNameRegex = nameRegex.test(this.signupDetails.full_name);
    // console.log("phoneRegex: ",testPhoneRegex);
    // console.log("emailRegex: ",testEmailRegex);
    // console.log("nameRegex: ",testNameRegex);
    // // testNameRegex?this.signupDetails.name:(console.log("name is invalid"));
    // // testPhoneRegex?this.signupDetails.phone:(console.log("phone is invalid"));
    // // testEmailRegex?(this.signupDetails.email = this.signupDetails.phone, this.signupDetails.phone=""):(console.log("email is invalid"));
    // // if(this.signupDetails.phone.length == 10){
    //   if((testPhoneRegex || testEmailRegex) && testNameRegex){
    //     this.util.presentLoading('Creating profile for you...');
    //     this.api.post('signupUser', this.signupDetails).subscribe((data:any)=>{
    //       console.log(data);
    //       this.util.dismissLoading();
    //       if(data.status == 200){
    //         this.util.presentToastWithOptions('Thank you, '+this.signupDetails.full_name+'!', 'Login to continue', null);
    //         this.resetForm('signup');
    //         // this.router.navigateByUrl('/login');
    //         this.signupCardToggle();
    //       }else{
    //         console.log(this.signupDetails,data.text);
    //         this.util.presentAlert('It looks like...',data.text,null,"Hold on "+this.signupDetails.full_name+"!");
    //       }
    //     }, (error:any)=>{
    //       console.log(error);
    //       this.util.presentAlert("Error!!!",error,null,null);
    //     });
    //   }else{
    //     if(!testPhoneRegex && !testEmailRegex){
    //       this.util.presentAlert("It looks like...","Entered phone number or email id is invalid",null);
    //     }else{
    //       console.log("Email or Phone is valid");
    //     }
    //     (!testNameRegex)?this.util.presentAlert("It looks like...","Name must only contain Alphabets",null):console.log("Name is valid");
    //   }
    // }else{
    //   this.util.presentToast('Hold on !!','Phone number must contain 10 digits',3000);
    //
    // }
  }

  checkIdentityType(){
    // check if identity exists
    // this.isIdentityExists = (this.loginDetails.identity.length>6)?true:false;

    const emailRegex = /\S+@\S+\.\S+/;
    const phoneRegex = /^\d+$/;
    this.loginDetails.type = (phoneRegex.test(this.loginDetails.identity) && this.loginDetails.identity.length == 9)?"phone":(emailRegex.test(this.loginDetails.identity)?"email":"username");
  }

  checkIfExists(value, type){
    // check if it already exists
    if(type=='phone'){
      this.isPhoneExists = true;
    } else if (type = 'email'){
      this.isEmailExists = true;
    } else if (type = 'username'){
      this.isUsernameExists = true;
    } else {
      console.log("Input type mismatch");
    }

  }

  signupCardToggle(){
    this.isShowSignupCard = !this.isShowSignupCard;
    this.alternateActionText = (this.isShowSignupCard)?"Login":"Signup";
  }



}
