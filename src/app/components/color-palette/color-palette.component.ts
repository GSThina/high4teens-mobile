import { Component, OnInit, Input } from '@angular/core';

import { EditorService } from '../../services/editor.service';

@Component({
  selector: 'app-color-palette',
  templateUrl: './color-palette.component.html',
  styleUrls: ['./color-palette.component.scss'],
})
export class ColorPaletteComponent implements OnInit {

	// @Input() data:any;

  constructor(
  	private editorService: EditorService
  ) { }

  ngOnInit() {
  	// console.log(this.data.theme);
  }

  selectColor(color){

    this.editorService.colorPaletteShow = (this.editorService.editor.color==color)?true:false;
    this.editorService.editor.color=color;
  }

}
