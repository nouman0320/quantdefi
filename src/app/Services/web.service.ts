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


  createItem(jsotStr: any): Observable<any>{
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    return this.http.post(this.baseURL + 'newitem', jsotStr,{
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