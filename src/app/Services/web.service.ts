import { Injectable } from '@angular/core';
// import { Http, Response, Headers } from '@angular/http';


// tslint:disable-next-line:import-blacklist
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { HttpClient, HttpResponse, HttpHeaders } from '../../../node_modules/@angular/common/http';



@Injectable()
export class WebService {

  // this is web service....
  baseURL: String = 'http://localhost:8000/';



  constructor(private http: HttpClient) { }



  createItemGroup(groupName: String, userId: String, assembly_id: String): Observable<any>{
    const body = {
      "name": groupName,
      "created_by": userId,
      "assembly_id":assembly_id
    }
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    return this.http.post(this.baseURL + 'createitemgroup', body,{
      headers: headers
    });
  }

  removeRequiredItem(id: String, parent_id: String, index: any): Observable<any>{
    const body = {
      "_id":id,
      "_parent_id":parent_id,
      "index":index
    }
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    return this.http.post(this.baseURL + 'removerequireditem', body,{
      headers: headers
    });
  }

  getRequiredItemForGroup(id: String, group_id: String): Observable<any>{
    //console.log(id);
    const body = {
      "_id":id,
      "_group_id":group_id
    }
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    return this.http.post(this.baseURL + 'getrequireditemforgroup', body,{
      headers: headers
    });
  }


  getRequiredItem(id: String, parent_id: String): Observable<any>{
    //console.log(id);
    const body = {
      "_id":id,
      "_parent_id":parent_id
    }
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    return this.http.post(this.baseURL + 'getrequireditem', body,{
      headers: headers
    });
  }


  deleteItemGroup(groupId: String, assembly_id: String, group_index: any):Observable<any>{
    const body = {
      "_group_id":groupId,
      "_assembly_id": assembly_id,
      "group_index":group_index
    }
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    return this.http.post(this.baseURL + 'deleteitemgroup', body,{
      headers: headers
    });
  }

  deleteItemInsideGroup(groupId: String, item_id: String, item_index: any):Observable<any>{
    const body = {
      "_group_id":groupId,
      "_item_id":item_id,
      "item_index":item_index
    }
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    return this.http.post(this.baseURL + 'deleteiteminsidegroup', body,{
      headers: headers
    });
  }

  getGroup(id: String):Observable<any>{
    console.log(id);
    const body = {
      "_id":id
    }
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    return this.http.post(this.baseURL + 'getgroup', body,{
      headers: headers
    });
  }

  openAssembly(id: String): Observable<any>{
    console.log(id);
    const body = {
      "_id":id
    }
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    return this.http.post(this.baseURL + 'openassembly', body,{
      headers: headers
    });
  }

  openItem(id: String): Observable<any>{
    console.log(id);
    const body = {
      "_id":id
    }
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    return this.http.post(this.baseURL + 'openitem', body,{
      headers: headers
    });
  }

  createItem(jsotStr: any): Observable<any>{
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    return this.http.post(this.baseURL + 'newitem', jsotStr,{
      headers: headers
    });
  }

  saveItem(jsotStr: any): Observable<any>{
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    return this.http.post(this.baseURL + 'saveitem', jsotStr,{
      headers: headers
    });
  }

  saveAssembly(jsotStr: any): Observable<any>{
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    return this.http.post(this.baseURL + 'saveassembly', jsotStr,{
      headers: headers
    });
  }

  createAssembly(jsotStr: any): Observable<any>{
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    return this.http.post(this.baseURL + 'newassembly', jsotStr,{
      headers: headers
    });
  }

  createFolder(folderType: String, folderLocality: String, folderParent: String, folderName: String, userId: String): Observable<any>{

    const body = {
      "type": folderType,
      "locality": folderLocality,
      "parent": folderParent,
      "name": folderName,
      "created_by": userId
    }

    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    return this.http.post(this.baseURL + 'newfolder', body,{
      headers: headers
    });
  }


  deleteFileSystem(id: String, type: String): Observable<any>{
    const body = {
     "_id":id,
     "type":type
    }

    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    return this.http.post(this.baseURL + 'delete-filesystem', body,{
      headers: headers
    });
  }

  getFileSystem(type: String, locality: String, user_id: String): Observable<any>{
    const body = {
     "type": type,
      "locality": locality,
      "created_by": user_id
    }

    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    return this.http.post(this.baseURL + 'filesystem', body,{
      headers: headers
    });
  }



  getFolder(folder_id: String, type: String, parent: String): Observable<any>{

    const body = {
      "folder_id":folder_id,
      "type":type,
      "parent_id":parent
    }

    console.log(body);
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    return this.http.post(this.baseURL + 'folder', body,{
      headers: headers
    });
  }

/*
  getUserFans(id: String, token: String){
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', 'Bearer ' + token) //Fan/51/fan/find
    return this.http.get(this.baseURL + 'Fan/' + id + '/fan/find', {
      headers: headers
    });
  }


  sendActivationMail(jsonStr: any) {
    const body = jsonStr;
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    return this.http.post(this.baseURL + 'accounts/mail/activation', body, {
      headers: headers
    });
  }

  */
}