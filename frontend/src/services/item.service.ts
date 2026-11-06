import { api } from "@/lib/api";
import type { ItemResponse } from "@shared/dtos/item.dto";
import type { PaginatedResponse } from "@shared/dtos/pagination.dto";
import type { ItemsCategory } from "@shared/filters/items/itemCategory.map";
import type { ItemsAdvancedFilter } from "@shared/filters/items/items.filter";
import type { ItemsState } from "@shared/filters/items/itemState.map";

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
}