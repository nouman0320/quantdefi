import { Component, OnInit, Input, ViewChild, ElementRef, ViewChildren} from '@angular/core';
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
import { Item } from 'src/app/Model/item';
import { ToasterServiceService } from 'src/app/Services/toaster-service.service';


@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss']
})
export class ItemsComponent implements OnInit {

  
  // for development
  admim: String = "5d134fa15ea09b2af8c37f01";
  //--

  @ViewChild("folder_name", null) folderInput: ElementRef;
  @ViewChild("itemName", null) itemNameInput: ElementRef;
  @ViewChild("itemId", null) itemIdInput: ElementRef;
  @ViewChild("itemUnit", null) itemUnitInput: ElementRef;
  @ViewChild("itemDescription", null) itemDescriptionInput: ElementRef;
  

  item: Item = null;
  itemStage: number = 0;
  itemInProgress: Boolean = false;

  deleteConfirm: Boolean = false;
  deleteID: String = null;
  deleteType: String = null;


  newFolderDialog: Boolean = false;
  newFolderLocality: String = '';
  newFolderType: String = '';
  newFolderParent: String = '';

  defaultRefresh: Boolean = false;

  nestedDefaultItemsTreeControl: NestedTreeControl<Folder>;
  nestedDefaultItemsDataSource: MatTreeNestedDataSource<Folder>;
  dataChange: BehaviorSubject<Folder[]> = new BehaviorSubject<Folder[]>([]);


  createNewItem(locality: String, parentId: String, created_by: String){

    this.itemNameInput.nativeElement.value = '';
    this.itemIdInput.nativeElement.value = '';
    this.itemUnitInput.nativeElement.value = '';
    this.itemDescriptionInput.nativeElement.value = '';

    this.item = new Item();
    this.item.parent = parentId;
    this.item.created_by = created_by;
    this.item.locality = locality;
    this.itemStage = 1;
  }


  cancelItem(){
    this.itemStage = 0;
  }

  addItem(itemName: String, itemId: String, itemUnit: String, itemDescription: String){
    //this.toasterService.Success("Add button clicked");
    console.log(itemName);
    console.log(itemId);
    console.log(itemUnit);
    console.log(itemDescription);


    var checkCount = 0;
    var errorStr = "";
    if(itemName=="")
    {
      errorStr+=" • Name";
      checkCount++;
    }

    if(itemId=="")
    {
      errorStr+=" • Id";
      checkCount++;
    }

    if(itemUnit=="")
    {
      errorStr+=" • Unit";
      checkCount++;
    }

    if(itemDescription=="")
    {
      errorStr+=" • Description";
      checkCount++;
    }


    if(checkCount>0){
      errorStr+=" must be valid."
      this.toasterService.Error(errorStr);
      return;
    }

    this.item.name = itemName;
    this.item.id_f = itemId;
    this.item.unit_of_measure = itemUnit;
    this.item.description = itemDescription;


    const jsonObj = {
      "locality": this.item.locality,
      "id_f": this.item.id_f,
      "name": this.item.name,
      "parent": this.item.parent,
      "created_by": this.item.created_by,
      "units": this.item.unit_of_measure,
      "description": this.item.description
    }

    this.itemInProgress = true;
    this.webService.createItem(jsonObj).subscribe(
      data=>{
        this.toasterService.Success("Item added");
        this.refreshFolders("default");
        this.itemStage = this.itemStage + 1;
      },
      err=>{
        this.toasterService.Error("Unable to add item");
        this.itemInProgress = false;
      },
      ()=>{
        this.itemInProgress = false;
      }
    );

  }

  addNewFolder(folderName: string){
    var rx = /[<>:"\/\\|?*\x00-\x1F]|^(?:aux|con|clock\$|nul|prn|com[1-9]|lpt[1-9])$/i;
    if(rx.test(folderName)) {
      alert("Folder name is invalid");
      return;
   }

   var u_id = null;
   if(this.newFolderType!="default"){
     u_id = this.admim;
     //alert(this.newFolderType);
   }

   //alert(u_id);

   this.webService.createFolder(this.newFolderType, this.newFolderLocality, this.newFolderParent, folderName, u_id).subscribe(
     data => {
      this.refreshFolders(this.newFolderType);
      this.toasterService.Success(folderName + " created.")
      //alert(data);
     },

     err => {
      //alert('Unable to create the folder right now'+err);
      this.toasterService.Error("Unable to create the folder right now.");
      //console.log(err);
     },

     () =>{
      this.cancelNewFolder();
     }
   );

  }

  cancelNewFolder(){
    this.newFolderLocality = '';
    this.newFolderType = '';
    this.newFolderParent = '';
    this.newFolderDialog = false;
    this.folderInput.nativeElement.value = '';
  }

  refreshFolders(type: String){
    if(type == 'default'){
      this.defaultRefresh = true;
      this.webService.getFileSystem('default', 'item', null).subscribe(
        data =>{
          console.log(data);
          this.dataChange.next(data);
        },
        err =>{
          console.log(err);
        },
        () =>{
          this.defaultRefresh = false;
        }
      );
    }
  }

  createNewFolder(type: String, locality: String, parent: String){
    this.newFolderLocality = locality;
    this.newFolderType = type;
    this.newFolderParent = parent;
    this.newFolderDialog = true;
  }


  constructor(public webService: WebService, public toasterService: ToasterServiceService) { 
    this.nestedDefaultItemsTreeControl = new NestedTreeControl<Folder>(this._getChildren);
    this.nestedDefaultItemsDataSource = new MatTreeNestedDataSource();


    

    this.dataChange.subscribe(data => this.nestedDefaultItemsDataSource.data = data);
    this.refreshFolders('default');
    

    /*
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
    */
  }


  delete_item(id: String){
    this.deleteID = id;
    this.deleteType = "item";
    this.deleteConfirm = true;
  }

  delete_folder(id: String){
    this.deleteID = id;
    this.deleteType = "folder";
    this.deleteConfirm = true;
  }

  deleteInProgress:Boolean = false;
  confirm_delete(){
    this.deleteInProgress = true;
    this.webService.deleteFileSystem(this.deleteID, this.deleteType).subscribe(
      data =>{
        this.refreshFolders("default");
        this.toasterService.Info("Deleted.")
      },
      err =>{
        this.toasterService.Error("Unable to perform the action.");
      },

      ()=>{
        this.cancel_delete();
      }
    );
  }

  cancel_delete(){
    this.deleteID = null;
    this.deleteType = null;
    this.deleteConfirm = false;
    this.deleteInProgress = false;
  }

  private _getChildren = (node: Folder) => { return observableOf(node.child_folder); };
  
  hasNestedChild = (_: number, nodeData: Folder) => {return (nodeData.type=="default"); };
  

  ngOnInit() {
    
  }

  


}
