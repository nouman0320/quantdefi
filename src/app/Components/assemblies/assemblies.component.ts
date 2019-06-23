import { Component, OnInit} from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/filter';

import {MatTreeNestedDataSource} from '@angular/material/tree';
import {NestedTreeControl} from '@angular/cdk/tree'
import {BehaviorSubject, Observable, of as observableOf, from} from 'rxjs';

import { WebService } from 'src/app/Services/web.service';
import { Folder } from 'src/app/Model/folder';


@Component({
  selector: 'app-assembliess',
  templateUrl: './assemblies.component.html',
  styleUrls: ['./assemblies.component.scss']
})
export class AssembliesComponent implements OnInit {

  nestedDefaultAssembliesTreeControl: NestedTreeControl<Folder>;
  nestedDefaultAssembliesDataSource: MatTreeNestedDataSource<Folder>;
  dataChange: BehaviorSubject<Folder[]> = new BehaviorSubject<Folder[]>([]);

  constructor(public webService: WebService) { 
    this.nestedDefaultAssembliesTreeControl = new NestedTreeControl<Folder>(this._getChildren);
    this.nestedDefaultAssembliesDataSource = new MatTreeNestedDataSource();

    this.dataChange.subscribe(data => this.nestedDefaultAssembliesDataSource.data = data);

    this.dataChange.next([
      {
        name: "03 00 00 - Concrete",
        type: "",
        childern_folders: [
          {
            name: "03 30 00 - Rebar",
            type: "",
            childern_folders: [

              {
                name: "Rebar For Beam - Linear",
                type: "a",
                childern_folders: [],
              }
            ],
          }
        ],
      },
      {
        name: "folder 3",
        type: "",
        childern_folders: [
          {
            name: "test3",
            type: "",
            childern_folders: [{
              name: "folder",
              type: "",
              childern_folders: [
                {
                  name: "test3",
                  type: "a",
                  childern_folders: [],
                }
              ],
            },
            {
              name: "folder 3",
              type: "",
              childern_folders: [
                {
                  name: "test3",
                  type: "a",
                  childern_folders: [],
                }
              ],
            },],
          }
        ],
      },
      
    ]);
  }

  private _getChildren = (node: Folder) => { return observableOf(node.childern_folders); };
  
  hasNestedChild = (_: number, nodeData: Folder) => {return !(nodeData.type); };
  

  ngOnInit() {
    
  }

  






}
