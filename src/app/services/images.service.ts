import { Injectable } from '@angular/core';

import { ApiService } from "./api.service";

// ES Modules syntax
import Unsplash from 'unsplash-js';
// require syntax
// const Unsplash = require('unsplash-js');

@Injectable({
  providedIn: 'root'
})

export class ImagesService {

	public imagesList:any = [];

  constructor(private api: ApiService) {
		//const unsplash = new Unsplash({ accessKey: "EJRbz6WqSz13YlyjmqwfWb5d8yrbty1WFJ9DWU8rILs" });
  }

  getImage(query:string){ //get-random-image

    return new Promise((resolve, reject)=>{

      this.api.post('get-random-image', {requiredImage:query}).subscribe((result:any)=>{
        console.log(result.image);
        resolve(result.image);
      }, (err:any) => {
        reject(err);
      })
  	});

  }

  searchImages(query, page){ //get-images

  	return new Promise((resolve, reject)=>{

      this.api.post('get-images', {requiredImage:query, page: page, imagesPerPage: 9}).subscribe((result:any)=>{
        console.log(result.image);
        resolve(result.image);
      })
  	});

  }

  public response = {
		  total: 133,
		  total_pages: 7,
		  results: [
		    {
		      "id": "eOLpJytrbsQ",
		      "created_at": "2014-11-18T14:35:36-05:00",
		      "width": 4000,
		      "height": 3000,
		      "color": "#A7A2A1",
		      "likes": 286,
		      "liked_by_user": false,
		      "description": "A man drinking a coffee.",
		      "urls": {
		        // "raw": "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f",
		        // "full": "https://hd.unsplash.com/photo-1416339306562-f3d12fefd36f",
		        // "regular": "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&s=92f3e02f63678acc8416d044e189f515",
		        // "small": "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&s=263af33585f9d32af39d165b000845eb",
		        "thumb": "logo-icon.png"
		      }
		    },
		    {
		      "id": "eOLpJytrbsQ",
		      "created_at": "2014-11-18T14:35:36-05:00",
		      "width": 4000,
		      "height": 3000,
		      "color": "#A7A2A1",
		      "likes": 286,
		      "liked_by_user": false,
		      "description": "A man drinking a coffee.",
		      "urls": {
		        // "raw": "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f",
		        // "full": "https://hd.unsplash.com/photo-1416339306562-f3d12fefd36f",
		        // "regular": "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&s=92f3e02f63678acc8416d044e189f515",
		        // "small": "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&s=263af33585f9d32af39d165b000845eb",
		        "thumb": "logo-icon.png"
		      }
		    },
		    {
		      "id": "eOLpJytrbsQ",
		      "created_at": "2014-11-18T14:35:36-05:00",
		      "width": 4000,
		      "height": 3000,
		      "color": "#A7A2A1",
		      "likes": 286,
		      "liked_by_user": false,
		      "description": "A man drinking a coffee.",
		      "urls": {
		        // "raw": "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f",
		        // "full": "https://hd.unsplash.com/photo-1416339306562-f3d12fefd36f",
		        // "regular": "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&s=92f3e02f63678acc8416d044e189f515",
		        // "small": "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&s=263af33585f9d32af39d165b000845eb",
		        "thumb": "logo-icon.png"
		      }
		    },
		    {
		      "id": "eOLpJytrbsQ",
		      "created_at": "2014-11-18T14:35:36-05:00",
		      "width": 4000,
		      "height": 3000,
		      "color": "#A7A2A1",
		      "likes": 286,
		      "liked_by_user": false,
		      "description": "A man drinking a coffee.",
		      "urls": {
		        // "raw": "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f",
		        // "full": "https://hd.unsplash.com/photo-1416339306562-f3d12fefd36f",
		        // "regular": "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&s=92f3e02f63678acc8416d044e189f515",
		        // "small": "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&s=263af33585f9d32af39d165b000845eb",
		        "thumb": "logo-icon.png"
		      }
		    },
		    {
		      "id": "eOLpJytrbsQ",
		      "created_at": "2014-11-18T14:35:36-05:00",
		      "width": 4000,
		      "height": 3000,
		      "color": "#A7A2A1",
		      "likes": 286,
		      "liked_by_user": false,
		      "description": "A man drinking a coffee.",
		      "urls": {
		        // "raw": "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f",
		        // "full": "https://hd.unsplash.com/photo-1416339306562-f3d12fefd36f",
		        // "regular": "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&s=92f3e02f63678acc8416d044e189f515",
		        // "small": "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&s=263af33585f9d32af39d165b000845eb",
		        "thumb": "logo-icon.png"
		      }
		    },
		    {
		      "id": "eOLpJytrbsQ",
		      "created_at": "2014-11-18T14:35:36-05:00",
		      "width": 4000,
		      "height": 3000,
		      "color": "#A7A2A1",
		      "likes": 286,
		      "liked_by_user": false,
		      "description": "A man drinking a coffee.",
		      "urls": {
		        // "raw": "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f",
		        // "full": "https://hd.unsplash.com/photo-1416339306562-f3d12fefd36f",
		        // "regular": "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&s=92f3e02f63678acc8416d044e189f515",
		        // "small": "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&s=263af33585f9d32af39d165b000845eb",
		        "thumb": "logo-icon.png"
		      }
		    },
		    {
		      "id": "eOLpJytrbsQ",
		      "created_at": "2014-11-18T14:35:36-05:00",
		      "width": 4000,
		      "height": 3000,
		      "color": "#A7A2A1",
		      "likes": 286,
		      "liked_by_user": false,
		      "description": "A man drinking a coffee.",
		      "urls": {
		        // "raw": "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f",
		        // "full": "https://hd.unsplash.com/photo-1416339306562-f3d12fefd36f",
		        // "regular": "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&s=92f3e02f63678acc8416d044e189f515",
		        // "small": "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&s=263af33585f9d32af39d165b000845eb",
		        "thumb": "logo-icon.png"
		      }
		    },
		    {
		      "id": "eOLpJytrbsQ",
		      "created_at": "2014-11-18T14:35:36-05:00",
		      "width": 4000,
		      "height": 3000,
		      "color": "#A7A2A1",
		      "likes": 286,
		      "liked_by_user": false,
		      "description": "A man drinking a coffee.",
		      "urls": {
		        // "raw": "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f",
		        // "full": "https://hd.unsplash.com/photo-1416339306562-f3d12fefd36f",
		        // "regular": "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&s=92f3e02f63678acc8416d044e189f515",
		        // "small": "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&s=263af33585f9d32af39d165b000845eb",
		        "thumb": "logo-icon.png"
		      }
		    },
		    {
		      "id": "eOLpJytrbsQ",
		      "created_at": "2014-11-18T14:35:36-05:00",
		      "width": 4000,
		      "height": 3000,
		      "color": "#A7A2A1",
		      "likes": 286,
		      "liked_by_user": false,
		      "description": "A man drinking a coffee.",
		      "urls": {
		        // "raw": "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f",
		        // "full": "https://hd.unsplash.com/photo-1416339306562-f3d12fefd36f",
		        // "regular": "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&s=92f3e02f63678acc8416d044e189f515",
		        // "small": "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&s=263af33585f9d32af39d165b000845eb",
		        "thumb": "logo-icon.png"
		      }
		    }
		    // more photos ...
		  ]
		};



}
