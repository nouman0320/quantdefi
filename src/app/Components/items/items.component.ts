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
  userId: String = "5d134fa15ea09b2af8c37f01";
  admim: String = "5d134fa15ea09b2af8c37f01";
  isAdmin: Boolean = true;
  //--

  @ViewChild("folder_name", null) folderInput: ElementRef;
  

  @ViewChild("itemName", null) itemNameInput: ElementRef;
  purchaseUnitValue: String = "";
  itemUnitValue: String = "";
  @ViewChild("itemUnit", null) itemUnitInput: ElementRef;
  @ViewChild("coverageRate1", null) coverageRate1Input: ElementRef;
  @ViewChild("coverageRate2", null) coverageRate2Input: ElementRef;
  @ViewChild("costType", null) costTypeInput: ElementRef;
  @ViewChild("unitCost", null) unitCostInput: ElementRef;
  @ViewChild("accountingCode", null) accountingCodeInput: ElementRef;
  

  openedItem: Item = null;
  openingItem: Boolean = false;
  isOpenedItemDefault: Boolean = false;

  item: Item = null;
  itemStage: number = 0;
  itemInProgress: Boolean = false;
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


  nestedCustomItemsTreeControl: NestedTreeControl<Folder>;
  nestedCustomItemsDataSource: MatTreeNestedDataSource<Folder>;
  customDataChange: BehaviorSubject<Folder[]> = new BehaviorSubject<Folder[]>([]);

  nestedDefaultItemsTreeControl: NestedTreeControl<Folder>;
  nestedDefaultItemsDataSource: MatTreeNestedDataSource<Folder>;
  dataChange: BehaviorSubject<Folder[]> = new BehaviorSubject<Folder[]>([]);


  createNewItem(locality: String, parentId: String, created_by: String){

    this.itemNameInput.nativeElement.value = '';
    this.purchaseUnitValue = '';
    this.itemUnitValue = '';
    this.itemUnitInput.nativeElement.value = '';
    this.coverageRate1Input.nativeElement.value = '';
    this.coverageRate2Input.nativeElement.value = '';
    this.costTypeInput.nativeElement.value = '';
    this.unitCostInput.nativeElement.value = '';
    this.accountingCodeInput.nativeElement.value = '';

    this.item = new Item();
    this.item.parent = parentId;
    this.item.created_by = created_by;
    this.item.locality = locality;
    this.itemStage = 1;
  }


  cancelItem(){
    this.itemStage = 0;
  }

  
  saveItem(saveAs: Boolean){

    var itemName = this.itemNameInput.nativeElement.value;
    var purchaseUnit = this.purchaseUnitValue;
    var itemUnit = this.itemUnitValue;
    var coverageRate1 = this.coverageRate1Input.nativeElement.value;
    var coverageRate2 = this.coverageRate2Input.nativeElement.value;
    var costType = this.costTypeInput.nativeElement.value;
    var unitCost = this.unitCostInput.nativeElement.value;
    var accountingCode = this.accountingCodeInput.nativeElement.value;

    //console.log(purchaseUnit);
    //console.log(itemUnit);

    var checkCount = 0;
    var errorStr = "";
    if(itemName=="")
    {
      errorStr+=" • Name";
      checkCount++;
    }

    if(purchaseUnit=="")
    {
      errorStr+=" • Purchase Unit";
      checkCount++;
    }

    if(itemUnit=="")
    {
      errorStr+=" • Item Unit";
      checkCount++;
    }

    if(coverageRate1=="")
    {
      errorStr+=" • Coverage Rate 1";
      checkCount++;
    }

    if(coverageRate2=="")
    {
      errorStr+=" • Coverage Rate 2";
      checkCount++;
    }

    if(costType=="")
    {
      errorStr+=" • Cost Type";
      checkCount++;
    }

    if(unitCost=="")
    {
      errorStr+=" • Unit Cost";
      checkCount++;
    }

    if(accountingCode=="")
    {
      errorStr+=" • Accounting Code";
      checkCount++;
    }


    if(checkCount>0){
      errorStr+=" must be valid."
      this.toasterService.Error(errorStr);
      return;
    }

   this.openedItem.name = itemName;
   this.openedItem.purchase_unit = purchaseUnit;
   this.openedItem.item_unit = itemUnit;
   this.openedItem.coverage_rate_1 = coverageRate1;
   this.openedItem.coverage_rate_2 = coverageRate2;
   this.openedItem.cost_type = costType;
   this.openedItem.unit_cost = unitCost;
   this.openedItem.accounting_code = accountingCode;



    const jsonObj = {
      "_save_as": saveAs,
      "_user_id": this.userId,
      "_id": this.openedItem._id,
      "locality": this.openedItem.locality,
      "name": this.openedItem.name,
      "parent": this.openedItem.parent,
      "created_by": this.openedItem.created_by,
      "purchase_unit": this.openedItem.purchase_unit,
      "item_unit": this.openedItem.item_unit,
      "coverage_rate_1": this.openedItem.coverage_rate_1,
      "coverage_rate_2": this.openedItem.coverage_rate_2,
      "cost_type": this.openedItem.cost_type,
      "unit_cost": this.openedItem.unit_cost,
      "accounting_code": this.openedItem.accounting_code
    }

    this.saveInProgress = true;
    this.webService.saveItem(jsonObj).subscribe(
      data=>{
        this.toasterService.Success("Item saved");
        this.openItem(data._id);
        this.refreshFolders('custom');
      },
      err=>{
        this.toasterService.Error("Unable to save");
        this.saveInProgress = false;
      },
      ()=>{
        this.saveInProgress = false;
      }
    );
  }

  addItem(){
  
    var itemName = this.itemNameInput.nativeElement.value;
    var purchaseUnit = this.purchaseUnitValue;
    var itemUnit = this.itemUnitValue;
    var coverageRate1 = this.coverageRate1Input.nativeElement.value;
    var coverageRate2 = this.coverageRate2Input.nativeElement.value;
    var costType = this.costTypeInput.nativeElement.value;
    var unitCost = this.unitCostInput.nativeElement.value;
    var accountingCode = this.accountingCodeInput.nativeElement.value;

    //console.log(purchaseUnit);
    //console.log(itemUnit);

    var checkCount = 0;
    var errorStr = "";
    if(itemName=="")
    {
      errorStr+=" • Name";
      checkCount++;
    }

    if(purchaseUnit=="")
    {
      errorStr+=" • Purchase Unit";
      checkCount++;
    }

    if(itemUnit=="")
    {
      errorStr+=" • Item Unit";
      checkCount++;
    }

    if(coverageRate1=="")
    {
      errorStr+=" • Coverage Rate 1";
      checkCount++;
    }

    if(coverageRate2=="")
    {
      errorStr+=" • Coverage Rate 2";
      checkCount++;
    }

    if(costType=="")
    {
      errorStr+=" • Cost Type";
      checkCount++;
    }

    if(unitCost=="")
    {
      errorStr+=" • Unit Cost";
      checkCount++;
    }

    if(accountingCode=="")
    {
      errorStr+=" • Accounting Code";
      checkCount++;
    }


    if(checkCount>0){
      errorStr+=" must be valid."
      this.toasterService.Error(errorStr);
      return;
    }

   this.item.name = itemName;
   this.item.purchase_unit = purchaseUnit;
   this.item.item_unit = itemUnit;
   this.item.coverage_rate_1 = coverageRate1;
   this.item.coverage_rate_2 = coverageRate2;
   this.item.cost_type = costType;
   this.item.unit_cost = unitCost;
   this.item.accounting_code = accountingCode;
   this.accountingCodeInput = this.accountingCodeInput;



    const jsonObj = {
      "locality": this.item.locality,
      "name": this.item.name,
      "parent": this.item.parent,
      "created_by": this.item.created_by,
      "purchase_unit": this.item.purchase_unit,
      "item_unit": this.item.item_unit,
      "coverage_rate_1": this.item.coverage_rate_1,
      "coverage_rate_2": this.item.coverage_rate_2,
      "cost_type": this.item.cost_type,
      "unit_cost": this.item.unit_cost,
      "accounting_code": this.item.accounting_code
    }

    this.itemInProgress = true;
    this.webService.createItem(jsonObj).subscribe(
      data=>{
        this.toasterService.Success("Item added");
        this.refreshFolders("default");
        this.refreshFolders("custom");
        this.itemStage = this.itemStage + 1;
        this.openItem(data._id);
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


  openItem(item_id: String){
    this.openedItem = new Item();
    this.openingItem = true;
    this.isOpenedItemDefault = false;

    this.webService.openItem(item_id).subscribe(
      data=>{
        this.openedItem._id = data._id;
        this.openedItem.name = data.name;
        this.openedItem.locality = data.locality;
        this.openedItem.parent = data.parent;
        this.openedItem.created_by = data.created_by;
        this.openedItem.purchase_unit = data.purchase_unit;
        this.openedItem.item_unit = data.item_unit;
        this.openedItem.coverage_rate_1 = data.coverage_rate_1;
        this.openedItem.coverage_rate_2 = data.coverage_rate_2;
        this.openedItem.cost_type = data.cost_type;
        this.openedItem.unit_cost = data.unit_cost;
        this.openedItem.accounting_code = data.accounting_code;

        if(this.openedItem.created_by == null){
          this.isOpenedItemDefault = true;
        }

        this.itemNameInput.nativeElement.value = this.openedItem.name;
        this.purchaseUnitValue = this.openedItem.purchase_unit;
        this.itemUnitValue = this.openedItem.item_unit;
        this.itemUnitInput.nativeElement.value =this.openedItem.item_unit;
        this.coverageRate1Input.nativeElement.value = this.openedItem.coverage_rate_1;
        this.coverageRate2Input.nativeElement.value = this.openedItem.coverage_rate_2;
        this.costTypeInput.nativeElement.value = this.openedItem.cost_type;
        this.unitCostInput.nativeElement.value = this.openedItem.unit_cost;
        this.accountingCodeInput.nativeElement.value = this.openedItem.accounting_code;


    
        this.itemStage = 2;
      },
      err =>{
        this.openingItem = false;
        this.toasterService.Error("Unable to open the item");
      },
      ()=>{
        this.openingItem = false;
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
     u_id = this.userId;
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
    else if(type == 'custom'){
      this.customRefresh = true;
      console.log("custom refresh called");
      this.webService.getFileSystem('custom', 'item', this.userId).subscribe(
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


  constructor(public webService: WebService, public toasterService: ToasterServiceService) { 
    this.nestedDefaultItemsTreeControl = new NestedTreeControl<Folder>(this._getChildren);
    this.nestedDefaultItemsDataSource = new MatTreeNestedDataSource();

    this.nestedCustomItemsTreeControl = new NestedTreeControl<Folder>(this._getChildren);
    this.nestedCustomItemsDataSource = new MatTreeNestedDataSource();

    

    this.dataChange.subscribe(data => this.nestedDefaultItemsDataSource.data = data);
    this.refreshFolders('default');

    this.customDataChange.subscribe(data => this.nestedCustomItemsDataSource.data = data);
    this.refreshFolders('custom');
    

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
        this.itemStage = 0;
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

  ngOnInit() {
    
  }

  


}
