import { Component, OnInit, Input } from '@angular/core';
import { UtilService } from '../../services/util.service';

import { EditorService } from "../../services/editor.service";

@Component({
  selector: 'app-grammar',
  templateUrl: './grammar.component.html',
  styleUrls: ['./grammar.component.scss'],
})
export class GrammarComponent implements OnInit {

  @Input() data: any;

  public proofReadList:any = [];

  constructor(
    public editorService: EditorService,
    private util: UtilService
  ) { }

  ngOnInit() {
    console.log(this.data);

    let matches = this.data.matches;

    for (let i = 0; i < matches.length; i++) {
      for (let j = 0; j < matches[i].replacements.length; j++) {
        matches[i].replacements[j].isSelected = false;
      }
    }

  }

  replaceMatch(context, replacement, i, j){

    this.data.matches[i].replacements[j].isSelected = !this.data.matches[i].replacements[j].isSelected;

    for (let k = 0; k < this.data.matches[i].replacements.length; k++) {
      if(j!=k){
        this.data.matches[i].replacements[k].isSelected = false;
      }
    }

    // if(!this.data.matches[i].replacements[j].isSelected){
    //   this.data.matches[i].replacements[j].isSelected = !this.data.matches[i].replacements[j].isSelected;
    // } else {
    //   this.data.matches[i].replacements[j].isSelected = !this.data.matches[i].replacements[j].isSelected;
    // }

    let itemIndex = this.proofReadList.findIndex(o => o.id === i);

    console.log(itemIndex);


    if(itemIndex==-1){
      this.proofReadList.push({
        id: i,
        context: context,
        replacement: replacement,
        isSelected: this.data.matches[i].replacements[j].isSelected
      });
    } else {
      this.proofReadList[itemIndex].isSelected = this.data.matches[i].replacements[j].isSelected;
    }

    console.log(this.proofReadList);

  }
  dismiss() {
    this.util.dismissModal(this);
  }

  ionViewWillLeave(){
    for (let j = 0; j < this.proofReadList.length; j++) {
      if(this.proofReadList[j].isSelected){
        this.editorService.grammarCorrections.push(this.proofReadList[j]);
      }
    }
    console.log(this.editorService.grammarCorrections);

  }



}
