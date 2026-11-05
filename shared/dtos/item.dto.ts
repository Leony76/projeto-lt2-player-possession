import type { ItemsCategory } from "@/maps/select/filters/ItemCategory.map";
import type { ItemsState } from "@/maps/select/filters/ItemSubcategory.map";

export type UserItemRequest = {};

export type UserItemResponse = {
  readonly   id : number; 
  imageURL      : string;
  name          : string;
  category      : Exclude<ItemsCategory, '_'    >;
  state         : Exclude<ItemsState, '_' >;
  description   : string;
  originalPrice : number;
  marketPrice   : number;
  units         : number;
};



export type ItemRequest = {};

export type ItemResponse = {
  readonly   id : number; 
  imageURL      : string;
  name          : string;
  category      : Exclude<ItemsCategory, '_'    >;
  state         : Exclude<ItemsState, '_' >;
  description   : string;
  originalPrice : number;
  marketPrice   : number;
};