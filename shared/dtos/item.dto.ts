import type { ItemsCategory } from "@shared/filters/items/itemCategory.map";
import type { ItemsState } from "@shared/filters/items/itemState.map";

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
  readonly id              : number; 
  imageURL                 : string;
  name                     : string;
  category                 : Exclude<ItemsCategory, '_'    >;
  state                    : Exclude<ItemsState, '_' >;
  description              : string | null;
  originalPrice            : number;
  averageMarketPrice       : number | null;
  averageTruckloadPrice    : number;
  averageTruckloadPrice1x1 : number | null;
  releaseYear              : number | null;
  createdAt                : Date;
  updatedAt                : Date;
};