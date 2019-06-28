import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { WebService } from '../Services/web.service';

export class Folder {

    _id: String;
    type: String;
    locality: String;
    name: String;
    child_folder: Folder[];
    child_file: Folder[];
    parent: String;
    created_by: String;
    creation_date: String;
    
	



}