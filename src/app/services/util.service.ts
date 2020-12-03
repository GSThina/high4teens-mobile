import { Injectable } from '@angular/core';

import { Platform } from '@ionic/angular';

import { ModalController } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
// import { IonRouterOutlet } from '@ionic/angular';
import { ActionSheetController, LoadingController, AlertController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { retry, catchError, finalize } from 'rxjs/operators';

import { Toast } from '@ionic-native/toast/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/camera/ngx';

import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';


import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import * as CryptoJS from 'crypto-js';

import * as moment from 'moment';

// import { WebView } from '@ionic-native/ionic-webview/ngx';
// import { File } from '@ionic-native/file/ngx';
// import { Camera,CameraOptions,PictureSourceType } from '@ionic-native/camera/ngx';
// import { FilePath } from '@ionic-native/file-path/ngx';

import { SocialSharing } from '@ionic-native/social-sharing/ngx';

import { ActivityModalPage 	} from '../components/activity-modal/activity-modal.page';
import { NotificationsModalComponent 	} from '../components/notifications-modal/notifications-modal.component';
import { FilterModalComponent 	} from '../components/filter-modal/filter-modal.component';
import { WriteComponentComponent } from '../components/write-component/write-component.component';

import { WriterOptionsComponent   } from '../components/writer-options/writer-options.component';
import { StatsFilterComponent   } from '../components/stats-filter/stats-filter.component';

// import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  public croppedImagepath = "";
  public isLoading = false;

  public imagePickerOptions = {
    maximumImagesCount: 1,
    quality: 50
  };


	public grid:any = {};
	public gridView:boolean = false;
	public viewArray:any = ['grid', 'list', 'slide', 'pop'];

  private key:string = "secret key 123";

  constructor(
    private storage: Storage,
    private toast: Toast,
    private camera: Camera,
    private crop: Crop,
    // private filePath: FilePath,
    // private webview: WebView,
    private file: File,
    private transfer: FileTransfer,
    private http: HttpClient,

    private socialSharing: SocialSharing,
    // private routerOutlet: IonRouterOutlet,
  	private modalController: ModalController,
  	public popoverController: PopoverController,
    public actionSheetController: ActionSheetController,
    public alertController: AlertController,
    public loadingController: LoadingController,
    public toastController: ToastController,
    public platform:Platform
    // public user: UserService
  ) {
  	// this.toggleView();
  }

	// public readTextFile(file, callback) {
	//     var rawFile = new XMLHttpRequest();
	//     rawFile.overrideMimeType("application/json");
	//     rawFile.open("GET", file, true);
	//     rawFile.onreadystatechange = function() {
	//         if (rawFile.readyState === 4 && rawFile.status == "200") {
	//             callback(rawFile.responseText);
	//         }
	//     }
	//     rawFile.send(null);
	// }


  public fileTransfer: FileTransferObject = this.transfer.create();

  imageUpload(filePath, fileName, profile) {
    let options: FileUploadOptions = {
       fileKey: profile.title,
       fileName: fileName,
       headers: {}
    }

    this.fileTransfer.upload(filePath, "addImages?userid="+ profile.userId + "&title=" + profile.title, options)
     .then((data) => {
       // success
       console.log("FileTransfer: Image Upload: Success", data);
     }, (err) => {
       // error
       console.log("FileTransfer: Image Upload: Error: ", err);
     })
  }

  imageDownload() {
    const url = 'http://www.example.com/file.pdf';
    this.fileTransfer.download(url, this.file.dataDirectory + 'file.pdf').then((entry) => {
      console.log('download complete: ' + entry.toURL());
    }, (error) => {
      // handle error
    });
  }




  setToStorage(key, value){
    console.log("UtilService: setToStorage() : " + key + " : " + value);
    return this.storage.set(key, value);
  }

  getFromStorage(key){
    return new Promise((resolve, reject)=>{
      this.storage.get(key).then((value) => {
        console.log("UtilService: getFromStorage() : " + key + " : " + value);
        resolve(value);
      });
    });
  }

  getAllKeysOfStorage(){
    return this.storage.keys();
  }

	toggleView(){
		this.gridView = !this.gridView;
		this.grid.size = (this.viewArray[0]!='grid')?4:12;
    this.setToStorage('isGridView', this.gridView);
	}

  async presentToast(title, message, duration) {
    const toast = await this.toastController.create({
      header: title,
      message: message,
      mode: "ios",
      duration: duration?duration:3000,
      position: 'top'
    });
    toast.present();
  }

  async presentToastWithOptions(title, message, cancelText) {
    const toast = await this.toastController.create({
      header: title,
      message: message,
      position: 'top',
      mode: "ios",
      duration: cancelText?10000:3000,
      buttons: [
        // {
        //   side: 'start',
        //   icon: 'star',
        //   text: 'Favorite',
        //   handler: () => {
        //     console.log('Favorite clicked');
        //   }
        // },
        {
          text: cancelText,
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    toast.present();
  }



	async presentModal(component, params?:any, id?:any, swipe?:boolean) {
    console.log("UtilService : presentModal() : ", params);

    let modal:any;

    if(params||id){
      modal = await this.modalController.create({
        component: component,
        swipeToClose: swipe,
        componentProps: {
          'data': params
        },
        id: id
      });
    } else {
      modal = await this.modalController.create({
        component: component,
        swipeToClose: true
      });
    }
    console.log("UtilService : presentModal() : modal : ", modal.componentProps);
    return await modal.present();
  }

  async presentPopover(ev: any, component, payload, mode?:any) {
    const popover = await this.popoverController.create({
      component: component,
      event: ev,
      translucent: true,
      mode: mode?mode:"ios",
      componentProps: {
        'data': payload
      }
    });
    return await popover.present();
  }

  dismissPopover() {
    console.log('dismissPopover');
    this.popoverController.dismiss();
  }

  async presentActionSheet(title, btns) {
    const actionSheet = await this.actionSheetController.create({
      header: title,
      buttons: btns
    });
    await actionSheet.present();
  }

  dismissModal(self, id?:string) {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      'dismissed': true,
      'id': id
    });
  }

  public loadingProgress:boolean = false;

  async presentLoading(text, duration?:number) {

    this.loadingProgress = true;

    const loading = await this.loadingController.create({
      message: text,
      mode: "ios",
      duration: duration?duration:3000
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();
    console.log('Loading dismissed with data:', data);
  }

  dismissLoading(){
    if(this.loadingProgress){
      this.loadingController.dismiss();
    } else {

    }
  }

  async presentAlert(subHeader, message, buttons?:any, header?:any) {
    const alert = await this.alertController.create({
      header: header?header:'Hold on!',
      subHeader: subHeader,
      message: message,
      mode: "ios",
      buttons: buttons?buttons:['OK']
    });

    await alert.present();
  }

  async presentInfo(header, message, subHeader){
    const alert = await this.alertController.create({
      header: header,
      subHeader: subHeader,
      message: message,
      mode: "ios",
      buttons: ['OK']
    });

    await alert.present();
  }

  share(message,userid){
    // this.socialSharing.share(message + "\nJoin our community: https://www.high4teens-app.web.app/signup");
    console.log("util.share message:",message);
    if(userid.localeCompare('myPost')==0){
      this.socialSharing.share(message + "\nDownload the app here: https://link.high4teens.in/highcom-app");
    }else if(userid.localeCompare('otherPost')==0){
      this.socialSharing.share(message + "\nI would recommend you \nDownloading the app to read: https://link.high4teens.in/highcom-app");
    }
  }

  async presentLoadingWithOptions() {
    const loading = await this.loadingController.create({
      spinner: null,
      duration: 5000,
      message: 'Click the backdrop to dismiss early...',
      translucent: true,
      cssClass: 'custom-class custom-loading',
      backdropDismiss: true
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();
    console.log('Loading dismissed with role:', role);
  }

  async presentAlertPrompt(header, inputs, buttons) {
    const alert = await this.alertController.create({
      header: header,
      inputs: inputs,
      buttons: buttons?buttons:['OK']
    });

    await alert.present();
  }

  pickImage(sourceType) {

    return new Promise((resolve, reject)=>{

      const options: CameraOptions = {
        quality: 100,
        sourceType: sourceType,
        destinationType: this.camera.DestinationType.FILE_URI,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE
      }
      this.camera.getPicture(options).then((imageData) => {
        console.log("Chosen Image: ", imageData);
        // imageData is either a base64 encoded string or a file URI
        // If it's base64 (DATA_URL):
        // let base64Image = 'data:image/jpeg;base64,' + imageData;
        this.cropImage(imageData).then((resp:any)=>{

          resolve(resp);
        })
      }, (err) => {
        // Handle error
        reject(err);
      });
    });
  }

  cropImage(fileUrl) {
    return new Promise((resolve, reject)=>{
      this.crop.crop(fileUrl, { quality: 50 })
        .then(
          newPath => {
            this.showCroppedImage(newPath.split('?')[0]).then((res:any)=>{
              resolve(res);
            })
          },
          error => {
            reject('Error cropping image' + error);
          }
        );
      });
  }

  showCroppedImage(ImagePath) {
    return new Promise((resolve, reject)=>{
      this.isLoading = true;
      var copyPath = ImagePath;
      var splitPath = copyPath.split('/');
      var imageName = splitPath[splitPath.length - 1];
      var filePath = ImagePath.split(imageName)[0];

      this.file.readAsDataURL(filePath, imageName).then(base64 => {
        this.croppedImagepath = base64;
        let profile = {
          filePath: filePath,
          imageName: imageName
        }
        resolve(profile);
        this.isLoading = false;
        return true;
      }, error => {
        reject('Error in showing image' + error);
        this.isLoading = false;
      });
    });
  }

  createFileName() {
    const d = new Date(),
    n = d.getTime(),
    newFileName = n + '.jpg';
    return newFileName;
  }

  public timer: number = 0;

  runTimerFor(span){
    this.timer = span;
    setInterval(()=>{
      this.timer--;
    }, 1000);
  }

  runTimerUpto(time){

  }

  updateApp(ev:any){
   console.log("inside the updateapp function: ");
   if (this.platform.is('cordova')) {
    window.location.href = "https://link.high4teens.in/highcom-app";
   }else{
    window.open("https://link.high4teens.in/highcom-app",'_blank');
   }
  }


//   takePicture(sourceType: PictureSourceType, profile) {
//     // return new Promise((resolve, reject)=>{
//       const options: CameraOptions = {
//         quality: 100,
//         sourceType: sourceType,
//         saveToPhotoAlbum: false,
//         correctOrientation: true
//       };
//       this.camera.getPicture(options).then(imagePath => {
//         if (this.platform.is('android') && sourceType ===
//         this.camera.PictureSourceType.PHOTOLIBRARY) {
//           this.filePath.resolveNativePath(imagePath).then(filePath => {
//           const correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
//           const currentName = imagePath.substring(
//             imagePath.lastIndexOf('/') + 1,
//             imagePath.lastIndexOf('?'));
//           this.imageUpload(correctPath, this.createFileName(), profile);
//         });
//        } else {
//         const currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
//         const correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
//         this.imageUpload(correctPath, this.createFileName(), profile);
//        }
//       });
//     // });
//   }
//
//   createFileName() {
//     const d = new Date(),
//     n = d.getTime(),
//     newFileName = n + '.jpg';
//     return newFileName;
//   }
//
//   copyFileToLocalDir(namePath, currentName, newFileName) {
//     this.file.copyFile(namePath, currentName, this.file.dataDirectory, newFileName).then(
//       success => {
//         this.updateStoredImages(newFileName);
//         // this.presentToast('Success while storing file.');
//       },
//       error => {
//         // this.presentToast('Error while storing file.');
//       });
//   }
//
//   public images: any = [];
//
//   updateStoredImages(name) {
//     this.storage.get('my_images').then(images => {
//       let arr = [];
//       if (images && images !== '' && images.length > 0) {
//         arr = JSON.parse(images);
//       } else {
//         arr = [];
//       }
//       if (!arr) {
//         const newImages = [name];
//         this.storage.set('my_images', JSON.stringify(newImages));
//       } else {
//         arr.push(name);
//         this.storage.set('my_images', JSON.stringify(arr));
//       }
//      const filePath = this.file.dataDirectory + name;
//      const resPath = this.pathForImage(filePath);
//      const newEntry = {
//         name: name,
//         path: resPath,
//         filePath: filePath
//      };
//      // return newEntry;
//      this.images = [newEntry, ...this.images];
//    });
//   }
//
//   pathForImage(img) {
//     if (img === null) {
//       return '';
//     } else {
//       let converted = this.webview.convertFileSrc(img);
//       return converted;
//     }
//   }
//
//
  startUpload(profile) {
    // let imgEntry = this.images[position];
    return new Promise((resolve, reject)=>{


      this.readFileAsBlob(profile).then((res:any)=>{
        resolve(res);
      });
      // this.file.resolveLocalFilesystemUrl(profile.filePath).then(entry => {
      //   ( < FileEntry > entry).file(file => {
      //     this.readFile(file , profile).then((res:any)=>{
      //       resolve(res);
      //     });
      //   });
      // }).catch(err => {
      //     this.presentToast('Oops', 'Error while reading file.', 3000);
      //     reject(err);
      // });
    });
 }
//
//
 readFileAsBlob(profile) {
   return new Promise((resolve, reject)=>{
     const reader = new FileReader();
     reader.onload = () => {
       const formData = new FormData();


       const contentType = 'image/png';
       const blob = this.b64toBlob(this.croppedImagepath, contentType, 512);
       const blobUrl = URL.createObjectURL(blob);
       //
       // const imgBlob = new Blob([reader.result], {
       //   type: file.type
       // });
       formData.append('file', blob, profile.imageName);
       resolve(this.uploadImageData(formData, profile));
     };
     // reader.readAsArrayBuffer(file);
   });
}

b64toBlob(b64Data, contentType='', sliceSize=512) {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, {type: contentType});
  return blob;
}
//
  async uploadImageData(formData: FormData, profile) {
    return new Promise((resolve, reject)=>{
      this.presentLoading('Uploading image...');
      this.http.post("addImages?userid="+ profile.userId + "&title=" + profile.title, formData).pipe(finalize(() => {
        this.dismissLoading();
      })).subscribe((res:any) => {
        console.log("URL Info after upload: ", res);
        if (res.url) {
          resolve(res);
          // this.presentToast('Done!','File upload complete.', 2000);
        } else {
          reject(res);
          this.presentToast('Oops!','File upload failed.', 2000);
        }
      });
    });
  }

  saveEditorToLocal(editor){
    if(editor.isQuill){
      editor.description.quillContent = editor.description.content.container.firstChild.innerHTML;
      editor.description.content = editor.description.content.getContents();
    }
    this.getFromStorage('drafts').then((drafts:any)=>{
      this.dismissModal(true);
      var a = [];
      let draftJson = JSON.parse(drafts);
      console.log("draftJson: ", draftJson);
      a = draftJson || [];
      if(editor.isDraft){
        //console.log(a.findIndex(o=>o.created_datetime === editor.created_datetime));
        a.splice(a.findIndex(o=>o.created_datetime === editor.created_datetime), 1);
      }
      editor.isDraft = true;
      a.push(editor);
      console.log(a);
      this.setToStorage('drafts', JSON.stringify(a));
    });
  }

  removeEditorFromLocal(editor){
    this.getFromStorage('drafts').then((drafts:any)=>{
      var a = [];
      let draftJson = JSON.parse(drafts);
      a = draftJson || [];
      a.splice(a.findIndex(o=>o.created_datetime === editor.created_datetime), 1);
      this.setToStorage('drafts', JSON.stringify(a));
    });
  }

  encrypt(message){
    // Encrypt
    console.log("Encrypting Message: ", message);
    let encrypted = CryptoJS.DES.encrypt(message, this.key);//.toString();
    console.log("Encrypted Message: ", encrypted);
    return encrypted;
  }

  decrypt(ciphertext){
    // Decrypt
    console.log("Ciphertext: ", ciphertext);
    var bytes  = CryptoJS.DES.decrypt(ciphertext, this.key);
    console.log("Ciphertext Bytes: ", bytes);
    let decrypted = bytes.toString(CryptoJS.enc.Utf8);
    console.log("Decrypted Message: ", decrypted);
    return decrypted;
  }

  generateRandomColorArray(num) {
    let colorArray = [];
    for (let i = 0; i < num; i++) {
      let hex = '#' + Math.floor(Math.random() * 16777215).toString(16);
      console.log(hex);
      colorArray.push(hex);
    }
    return colorArray;
  }

  generateDarkShades(num, r, g, b){
    let colorArray = [];
    for(let i=2; i<=num*2; i+=2){
      let color = 'rgb(' + (i*r/10) + ', ' + (i*g/10) + ', ' + (i*b/10) + ')';
      colorArray.push(color);
    }
    return colorArray;
  }

  generateLightShades(num, r, g, b){
    let colorArray = [];
    for(let i=num*5; i>=5; i-=5){
      let color = 'rgb(' + (i*r/10) + ', ' + (i*g/10) + ', ' + (i*b/10) + ')';
      colorArray.push(color);
    }
    return colorArray;
  }

  getUniqueByValue(a, cond) {
    return a.filter((e, i) => a.findIndex(e2 => cond(e, e2)) === i);
  }

//
//   deleteImage(imgEntry, position) {
//     this.images.splice(position, 1);
//     this.storage.get('my_images').then(images => {
//       const arr = JSON.parse(images);
//       const filtered = arr.filter(name => name !== imgEntry.name);
//       this.storage.set('my_images', JSON.stringify(filtered));
//       const correctPath = imgEntry.filePath.substr(0,
//         imgEntry.filePath.lastIndexOf('/') + 1);
//       this.file.removeFile(correctPath, imgEntry.name).then(res => {
//         this.presentToast('Okey!','File removed.', 2000);
//       });
//     });
//   }


}
