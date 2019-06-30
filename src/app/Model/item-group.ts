import { Item } from './item';

export class ItemGroup {
    _id: String;
    name: String;
    created_by: String;
    group_items: Item[]=[];
}