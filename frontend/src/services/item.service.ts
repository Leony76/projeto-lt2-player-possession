import { api } from "@/lib/api";
import type { ItemDetailsResponse, ItemResponse, UpdateUserItemUnitsResponse, UserItemResponse } from "@shared/dtos/item.dto";
import type { SuccessfulOperationResponse } from "@shared/dtos/operationResult.dto";
import type { PaginatedResponse } from "@shared/dtos/pagination.dto";
import type { ItemsCategory } from "@shared/maps/filters/items/itemCategory.map";
import type { ItemsAdvancedFilter } from "@shared/maps/filters/items/items.filter";
import type { ItemsState } from "@shared/maps/filters/items/itemState.map";

type GetItemsParams = {
  page            : number;
  limit           : number;
  search?         : string;
  category?       : ItemsCategory;
  state?          : ItemsState;
  advancedFilter? : ItemsAdvancedFilter;
};

export class ItemService {

  public static async get(
    params  : GetItemsParams,
    signal? : AbortSignal,
  ): Promise<PaginatedResponse<ItemResponse>> {

    const { data } = await api.get<
      PaginatedResponse<
        ItemResponse>>(
          "/item/get", 
          { params, signal },
        );  

    return data;
  }



  public static async getItemDetails(
    itemId : number,
  ): Promise<ItemDetailsResponse> {

    const { data } = await api.get<
      ItemDetailsResponse>(
        `/item/get/${itemId}`
      )
    ;
    
    return data;
  }



  public static async updateUserItemUnits(
    itemId : number,
    units  : number,
  ): Promise<SuccessfulOperationResponse<UpdateUserItemUnitsResponse>> {

    const { data } = await api.patch<
      SuccessfulOperationResponse<UpdateUserItemUnitsResponse>>(
        `/item/${itemId}/update-user-units`, {
          units
        }
      );
    ;
    
    return data;
  }


  public static async getUserItemsFromHome(): Promise<UserItemResponse[]> {

    const { data } = await api.get<UserItemResponse[]>(
      `/item/user/get-to-home`
    );
    
    return data;
  }



  public static async getUserItems(
    params  : GetItemsParams,
    signal? : AbortSignal,
  ): Promise<PaginatedResponse<UserItemResponse>> {

    const { data } = await api.get<
      PaginatedResponse<UserItemResponse>>(
        `/item/user/get`,
        { params, signal },
    );
    
    return data;
  }
}