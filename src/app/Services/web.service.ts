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