import { NgModule, Injectable, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicStorageModule } from '@ionic/storage';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { Toast } from '@ionic-native/toast/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { File } from '@ionic-native/file/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { Network } from '@ionic-native/network/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
// import { Push, PushObject, PushOptions } from '@ionic-native/push/ngx';

import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';

import { GoogleChartsModule } from 'angular-google-charts';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';

import { ActivityModalPage 	} from './components/activity-modal/activity-modal.page';
import { NotificationsModalComponent 	} from './components/notifications-modal/notifications-modal.component';
import { FilterModalComponent   } from './components/filter-modal/filter-modal.component';
import { WriterOptionsComponent } from './components/writer-options/writer-options.component';
import { StatsFilterComponent   } from './components/stats-filter/stats-filter.component';
import { WriteComponentComponent } from './components/write-component/write-component.component';
import { PostDetailComponent } from './components/post-detail/post-detail.component';
import { ColorPaletteComponent } from './components/color-palette/color-palette.component';
import { ImageSearchComponent } from './components/image-search/image-search.component';
import { GrammarComponent } from './components/grammar/grammar.component';
import { BadgeComponent } from './components/badge/badge.component';
import { SettingsComponent } from './components/settings/settings.component';

import { ServiceWorkerModule } from '@angular/service-worker';
import { HTTP } from '@ionic-native/http/ngx';

// import { InterceptorService } from './services/interceptor.service';

import { HttpClientModule } from '@angular/common/http';
// import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { environment } from '../environments/environment';

// import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { ProfileComponent } from './components/profile/profile.component';
import { SearchPage } from './pages/search/search.page';

// @Injectable()
// export class CustomHammerConfig extends HammerGestureConfig {
//     overrides = {
//         'press': { time: 500 },  //set press delay for .5 second
//         // 'swipe': { velocity: 0.3 }  //set the velocity of the swipe
//     }
// }

// import * as Quill from 'quill';

// import { Quill } from '../../node_modules/quill/core/quill';

// import * as Quill from '../../node_modules/quill/core/quill';

@NgModule({
  declarations: [
  								AppComponent,
  								ActivityModalPage,
  								NotificationsModalComponent,
  								FilterModalComponent,
                  WriterOptionsComponent,
                  StatsFilterComponent,
                  PostDetailComponent,
                  WriteComponentComponent,
                  ColorPaletteComponent,
                  ImageSearchComponent,
                  GrammarComponent,
                  ProfileComponent,
                  BadgeComponent,
                  SettingsComponent,
                  SearchPage
  							],
  entryComponents: [
  								ActivityModalPage,
  								NotificationsModalComponent,
  								FilterModalComponent,
                  WriterOptionsComponent,
                  StatsFilterComponent,
                  PostDetailComponent,
                  WriteComponentComponent,
                  ColorPaletteComponent,
                  ImageSearchComponent,
                  GrammarComponent,
                  ProfileComponent,
                  BadgeComponent,
                  SettingsComponent,
                  SearchPage
  							],
  imports: [
                  BrowserModule,
                  HammerModule,
                  IonicModule.forRoot({mode: 'md'}),
                  IonicStorageModule.forRoot(),
                  AppRoutingModule,
                  HttpClientModule,
                  Ng2GoogleChartsModule,
                  ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
                ],
  providers: [
    StatusBar,
    SplashScreen,
    Network,
    Crop, File, Camera, Toast,
    SocialSharing,
    LocalNotifications,
    FileTransfer,
    HTTP,
    // Push,
    // { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
    // { provide: HAMMER_GESTURE_CONFIG, useClass: CustomHammerConfig }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class AppModule {}
