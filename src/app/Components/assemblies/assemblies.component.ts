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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Item } from 'src/app/Model/item';
import { ItemGroup } from 'src/app/Model/item-group';


@Component({
  selector: 'app-assembliess',
  templateUrl: './assemblies.component.html',
  styleUrls: ['./assemblies.component.scss']
})
export class AssembliesComponent implements OnInit {

  // for development
  userId: String = "5d134fa15ea09b2af8c37f01";
  admim: String = "5d134fa15ea09b2af8c37f01";
  isAdmin: Boolean = true;
  //--

  @ViewChild("folder_name", null) folderInput: ElementRef;
  @ViewChild("assemblyName", null) assemblyNameInput: ElementRef;
  @ViewChild("assemblyId", null) assemblyIdInput: ElementRef;
  @ViewChild("assemblyUnit", null) assemblyUnitInput: ElementRef;
  @ViewChild("assemblyDescription", null) assemblyDescriptionInput: ElementRef;
  


  // items modal
  customModalRefresh: Boolean = false;
  modelType: String = "";

  nestedCustomItemsModalTreeControl: NestedTreeControl<Folder>;
  nestedCustomItemsModalDataSource: MatTreeNestedDataSource<Folder>;
  customModalDataChange: BehaviorSubject<Folder[]> = new BehaviorSubject<Folder[]>([]);


  defaultModalRefresh: Boolean = false;

  nestedDefaultItemsModalTreeControl: NestedTreeControl<Folder>;
  nestedDefaultItemsModalDataSource: MatTreeNestedDataSource<Folder>;
  defaultModalDataChange: BehaviorSubject<Folder[]> = new BehaviorSubject<Folder[]>([]);

  requiredItems: Item[] = [];
  gettingRequiredItems: Boolean = false;
  //


  // for item groups
  newItemGroup: Boolean = false;
  itemGroup: ItemGroup[] = [];


  toAddGroupId: String;
  //

  openedAssembly: Assembly = null;
  openingAssembly: Boolean = false;
  isOpenedAssemblyDefault: Boolean = false;

  assembly: Assembly = null;
  assemblyStage: number = 0;
  assemblyInProgress: Boolean = false;
  saveInProgress: Boolean = false;


  deleteConfirm: Boolean = false;
  deleteID: String = null;
  deleteType: String = null;


  newFolderDialog: Boolean = false;
  newFolderLocality: String = '';
  newFolderType: String = '';
  newFolderParent: String = '';

  defaultRefresh: Boolean = false;
  customRefresh: Boolean = false;


  nestedCustomAssembliesTreeControl: NestedTreeControl<Folder>;
  nestedCustomAssembliesDataSource: MatTreeNestedDataSource<Folder>;
  customDataChange: BehaviorSubject<Folder[]> = new BehaviorSubject<Folder[]>([]);

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
    this.requiredItems = [];
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
        this.refreshFolders("custom");
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

  openAssembly(assembly_id: String){
    this.openedAssembly = new Assembly();
    this.openingAssembly = true;
    this.isOpenedAssemblyDefault = false;
    this.requiredItems = [];
    this.itemGroup = [];

    /*
    
    const jsonObj = {
      "locality": this.assembly.locality,
      "id_f": this.assembly.id_f,
      "name": this.assembly.name,
      "parent": this.assembly.parent,
      "created_by": this.assembly.created_by,
      "units": this.assembly.unit_of_measure,
      "description": this.assembly.description
    }

    */
    this.webService.openAssembly(assembly_id).subscribe(
      data=>{
        this.openedAssembly._id = data._id;
        this.openedAssembly.locality = data.locality;
        this.openedAssembly.id_f = data.id_f;
        this.openedAssembly.name = data.name;
        this.openedAssembly.parent = data.parent;
        this.openedAssembly.created_by = data.parent;
        this.openedAssembly.unit_of_measure = data.unit;
        this.openedAssembly.description = data.description;

        var item_ids = data.required_item;

        var group_ids = data.group_item;

        if(group_ids!=null){
          for(let i=0;i<group_ids.length;i++){

            this.webService.getGroup(group_ids[i]).subscribe(

              data=>{
                var t_group = new ItemGroup();
                t_group._id = data._id;
                t_group.created_by = data.created_by;
                t_group.name = data.name;

                var group_item_ids = data.group_items;

                for(let i=0;i<group_item_ids.length;i++){

                  this.webService.openItem(group_item_ids[i]).subscribe(
                    data=>{
      
                      var t_item = new Item();
      
                      t_item._id = data._id;
                      t_item.accounting_code = data.accounting_code;
                      t_item.cost_type = data.cost_type;
                      t_item.coverage_rate_1 = data.coverage_rate_1;
                      t_item.coverage_rate_2 = data.coverage_rate_2;
                      t_item.created_by = data.created_by;
                      t_item.item_unit = data.item_unit;
                      t_item.locality = data.locality;
                      t_item.name = data.name;
                      t_item.parent = data.parent;
                      t_item.purchase_unit = data.purchase_unit;
                      t_item.unit_cost = data.unit_cost;
      
                      t_group.group_items.push(t_item);
                     
                      
                    }
                  );
      
                }
              
                this.itemGroup.push(t_group);
              }

            );

          }
        }

        console.log(this.itemGroup);

        this.gettingRequiredItems = true;
        if(item_ids!=null){
          for(let i=0;i<item_ids.length;i++){

            this.webService.openItem(item_ids[i]).subscribe(
              data=>{

                var t_item = new Item();

                t_item._id = data._id;
                t_item.accounting_code = data.accounting_code;
                t_item.cost_type = data.cost_type;
                t_item.coverage_rate_1 = data.coverage_rate_1;
                t_item.coverage_rate_2 = data.coverage_rate_2;
                t_item.created_by = data.created_by;
                t_item.item_unit = data.item_unit;
                t_item.locality = data.locality;
                t_item.name = data.name;
                t_item.parent = data.parent;
                t_item.purchase_unit = data.purchase_unit;
                t_item.unit_cost = data.unit_cost;

                this.requiredItems.push(t_item);
                console.log(data);
                this.gettingRequiredItems = false;
              }, err=>{
                this.gettingRequiredItems = false;
                console.log(err);
              }
            );

          }
        } else {
          this.gettingRequiredItems = false;
        }
        
        if(this.openedAssembly.created_by == null){
          this.isOpenedAssemblyDefault = true;
        }

        this.assemblyNameInput.nativeElement.value = this.openedAssembly.name;
        this.assemblyIdInput.nativeElement.value = this.openedAssembly.id_f;
        this.assemblyUnitInput.nativeElement.value = this.openedAssembly.unit_of_measure;
        this.assemblyDescriptionInput.nativeElement.value = this.openedAssembly.description;

        this.assemblyStage = 2;
      },
      err =>{
        this.openingAssembly = false;
        this.toasterService.Error("Unable to open the assembly");
      },
      ()=>{
        this.openingAssembly = false;
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
    else if(type == 'custom'){
      this.customRefresh = true;
      console.log("custom refresh called");
      this.webService.getFileSystem('custom', 'assembly', this.userId).subscribe(
        data =>{
          console.log(data);
          this.customDataChange.next(data);
        },
        err =>{
          console.log(err);
        },
        () =>{
          this.customRefresh = false;
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


  constructor(public webService: WebService, public toasterService: ToasterServiceService, public modalService: NgbModal) { 
    this.nestedDefaultAssembliesTreeControl = new NestedTreeControl<Folder>(this._getChildren);
    this.nestedDefaultAssembliesDataSource = new MatTreeNestedDataSource();


    this.nestedCustomAssembliesTreeControl = new NestedTreeControl<Folder>(this._getChildren);
    this.nestedCustomAssembliesDataSource = new MatTreeNestedDataSource();



    this.customDataChange.subscribe(data => this.nestedCustomAssembliesDataSource.data = data);
    this.refreshFolders('custom');
    

    this.dataChange.subscribe(data => this.nestedDefaultAssembliesDataSource.data = data);
    this.refreshFolders('default');
    
    this.nestedCustomItemsModalTreeControl = new NestedTreeControl<Folder>(this._getChildren);
    this.nestedCustomItemsModalDataSource = new MatTreeNestedDataSource();
    this.customModalDataChange.subscribe(data => this.nestedCustomItemsModalDataSource.data = data);

    this.nestedDefaultItemsModalTreeControl = new NestedTreeControl<Folder>(this._getChildren);
    this.nestedDefaultItemsModalDataSource = new MatTreeNestedDataSource();
    this.defaultModalDataChange.subscribe(data => this.nestedDefaultItemsModalDataSource.data = data);

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
        this.refreshFolders("custom");
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
  
  hasCustomNestedChild = (_: number, nodeData: Folder) => {return (nodeData.type=="custom"); };

  hasCustomModalNestedChild = (_: number, nodeData: Folder) => {return (nodeData.type=="custom"); };

  hasDefaultModalNestedChild = (_: number, nodeData: Folder) => {return (nodeData.type=="default"); };

  ngOnInit() {
    
  }


  deleteRequiredItem(id: String, index: any){
    
    this.webService.removeRequiredItem(id, this.openedAssembly._id, index).subscribe(data=>{
      this.requiredItems.splice(index, 1);
      console.log(this.requiredItems);
    }, err=>{
      this.toasterService.Error("Unable to delete right now");
    });
  }


  addRequiredItem(id: String){
    //console.log(id);

    if(this.modelType == 'individual'){
      this.gettingRequiredItems = true;
      var item = new Item();
      this.webService.getRequiredItem(id, this.openedAssembly._id).subscribe(
        data =>{
  
          item._id = data._id;
          item.accounting_code = data.accounting_code;
          item.cost_type = data.cost_type;
          item.coverage_rate_1 = data.coverage_rate_1;
          item.coverage_rate_2 = data.coverage_rate_2;
          item.created_by = data.created_by;
          item.item_unit = data.item_unit;
          item.locality = data.locality;
          item.name = data.name;
          item.parent = data.parent;
          item.purchase_unit = data.purchase_unit;
          item.unit_cost = data.unit_cost;
  
          this.requiredItems.push(item);
  
        }, err => {
  
        } , ()=>{
          this.gettingRequiredItems = false;
        }
      );
    } else if(this.modelType == 'group'){


      var item = new Item();
      this.webService.getRequiredItemForGroup(id, this.toAddGroupId).subscribe(
        data =>{
  
          item._id = data._id;
          item.accounting_code = data.accounting_code;
          item.cost_type = data.cost_type;
          item.coverage_rate_1 = data.coverage_rate_1;
          item.coverage_rate_2 = data.coverage_rate_2;
          item.created_by = data.created_by;
          item.item_unit = data.item_unit;
          item.locality = data.locality;
          item.name = data.name;
          item.parent = data.parent;
          item.purchase_unit = data.purchase_unit;
          item.unit_cost = data.unit_cost;


          //console.log(item);
          //console.log("+++")

          for(let i=0; i<this.itemGroup.length;i++){
            if(this.itemGroup[i]._id == this.toAddGroupId){
              this.itemGroup[i].group_items.push(item);
              console.log(this.itemGroup[i]);
            }
          }
  
        }
      );


    }

    

  }


  addNewItemGroup(){
    this.newItemGroup = true;
  }

  addNewItemGroupConfirm(groupName: string){
    var rx = /[<>:"\/\\|?*\x00-\x1F]|^(?:aux|con|clock\$|nul|prn|com[1-9]|lpt[1-9])$/i;
    if(rx.test(groupName)) {
      alert("Group name is invalid");
      return;
   }

    if(groupName==''){
      this.toasterService.Warning("Group name can not be empty");
      return;
    }

    var tItemGroup = new ItemGroup();

    this.webService.createItemGroup(groupName, this.userId, this.openedAssembly._id).subscribe(
      data=>{
        this.toasterService.Success(groupName+" is created");
        tItemGroup._id = data._id;
        tItemGroup.created_by = this.userId;
        tItemGroup.name = groupName;
        tItemGroup.group_items = [];
        this.itemGroup.push(tItemGroup);
      }, err =>{
        this.toasterService.Error("Unable to create group right now");
      }

    );

    this.newItemGroup = false;
  }

  addNewItemGroupCancel(){

    this.newItemGroup = false;
  }


  moveItemUp(group_id: String, item_id: String, item_index: any){

  }

  moveItemDown(group_id: String, item_id: String, item_index: any){

  }

  deleteItemInsideGroup(groupId: String, item_id: String, item_index: any){

  }
  
  deleteItemGroup(groupId: String, index: any){

  }

  addItemToGroup(content, groupId: String){
    this.openXl(content, 'group');
    this.toAddGroupId = groupId;
  }

  openXl(content, type: String) { 
    this.modalService.open(content, {size: 'lg'});   

    this.modelType = type;
    this.customModalRefresh = true;
    this.defaultModalRefresh = true;
      this.webService.getFileSystem('custom', 'item', this.userId).subscribe(
        data =>{
          console.log(data);
          this.customModalDataChange.next(data);
        },
        err =>{
          console.log(err);
        },
        () =>{
          this.customModalRefresh = false;
        }
      );

      this.webService.getFileSystem('default', 'item', null).subscribe(
        data =>{
          console.log(data);
          this.defaultModalDataChange.next(data);
        },
        err =>{
          console.log(err);
        },
        () =>{
          this.defaultModalRefresh = false;
        }
      );
  }





}
