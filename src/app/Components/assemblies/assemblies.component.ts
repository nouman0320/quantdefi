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
import { Assembly } from 'src/app/Model/assembly';
import { ToasterServiceService } from 'src/app/Services/toaster-service.service';


@Component({
  selector: 'app-assembliess',
  templateUrl: './assemblies.component.html',
  styleUrls: ['./assemblies.component.scss']
})
export class AssembliesComponent implements OnInit {

  // for development
  admim: String = "5d134fa15ea09b2af8c37f01";
  //--

  @ViewChild("folder_name", null) folderInput: ElementRef;
  @ViewChild("assemblyName", null) assemblyNameInput: ElementRef;
  @ViewChild("assemblyId", null) assemblyIdInput: ElementRef;
  @ViewChild("assemblyUnit", null) assemblyUnitInput: ElementRef;
  @ViewChild("assemblyDescription", null) assemblyDescriptionInput: ElementRef;
  

  assembly: Assembly = null;
  assemblyStage: number = 0;
  assemblyInProgress: Boolean = false;

  deleteConfirm: Boolean = false;
  deleteID: String = null;
  deleteType: String = null;


  newFolderDialog: Boolean = false;
  newFolderLocality: String = '';
  newFolderType: String = '';
  newFolderParent: String = '';

  defaultRefresh: Boolean = false;

  nestedDefaultAssembliesTreeControl: NestedTreeControl<Folder>;
  nestedDefaultAssembliesDataSource: MatTreeNestedDataSource<Folder>;
  dataChange: BehaviorSubject<Folder[]> = new BehaviorSubject<Folder[]>([]);


  createNewAssembly(locality: String, parentId: String, created_by: String){

    this.assemblyNameInput.nativeElement.value = '';
    this.assemblyIdInput.nativeElement.value = '';
    this.assemblyUnitInput.nativeElement.value = '';
    this.assemblyDescriptionInput.nativeElement.value = '';

    this.assembly = new Assembly();
    this.assembly.parent = parentId;
    this.assembly.created_by = created_by;
    this.assembly.locality = locality;
    this.assemblyStage = 1;
  }


  cancelAssembly(){
    this.assemblyStage = 0;
  }

  addAssembly(assemblyName: String, assemblyId: String, assemblyUnit: String, assemblyDescription: String){
    //this.toasterService.Success("Add button clicked");
    console.log(assemblyName);
    console.log(assemblyId);
    console.log(assemblyUnit);
    console.log(assemblyDescription);


    var checkCount = 0;
    var errorStr = "";
    if(assemblyName=="")
    {
      errorStr+=" • Name";
      checkCount++;
    }

    if(assemblyId=="")
    {
      errorStr+=" • Id";
      checkCount++;
    }

    if(assemblyUnit=="")
    {
      errorStr+=" • Unit";
      checkCount++;
    }

    if(assemblyDescription=="")
    {
      errorStr+=" • Description";
      checkCount++;
    }


    if(checkCount>0){
      errorStr+=" must be valid."
      this.toasterService.Error(errorStr);
      return;
    }

    this.assembly.name = assemblyName;
    this.assembly.id_f = assemblyId;
    this.assembly.unit_of_measure = assemblyUnit;
    this.assembly.description = assemblyDescription;


    const jsonObj = {
      "locality": this.assembly.locality,
      "id_f": this.assembly.id_f,
      "name": this.assembly.name,
      "parent": this.assembly.parent,
      "created_by": this.assembly.created_by,
      "units": this.assembly.unit_of_measure,
      "description": this.assembly.description
    }

    this.assemblyInProgress = true;
    this.webService.createAssembly(jsonObj).subscribe(
      data=>{
        this.toasterService.Success("Assembly added");
        this.refreshFolders("default");
        this.assemblyStage = this.assemblyStage + 1;
      },
      err=>{
        this.toasterService.Error("Unable to add assembly");
        this.assemblyInProgress = false;
      },
      ()=>{
        this.assemblyInProgress = false;
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
      this.webService.getFileSystem('default', 'assembly', null).subscribe(
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
    this.nestedDefaultAssembliesTreeControl = new NestedTreeControl<Folder>(this._getChildren);
    this.nestedDefaultAssembliesDataSource = new MatTreeNestedDataSource();


    

    this.dataChange.subscribe(data => this.nestedDefaultAssembliesDataSource.data = data);
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
