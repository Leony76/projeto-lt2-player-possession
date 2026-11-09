import type { ItemsCategory } from "@shared/maps/filters/items/itemCategory.map";
import type { ItemsState } from "@shared/maps/filters/items/itemState.map";

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
};



export type UserItemRequest = {};

export type UserItemResponse = ItemResponse & {
  units : number;
};

export type UserItemFromHomeResponse = {
  items      : UserItemResponse[];
  totalItems : number;
};


export type ItemDetailsRequest = {};

export type ItemDetailsResponse = {
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

  unitsLoggedUserHas : number;
};

export type UpdateUserItemUnitsResponse = {
  units : number;
  name  : string; 
}