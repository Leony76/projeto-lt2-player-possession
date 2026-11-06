import type { ItemsCategory } from "./itemCategory.map";
import type { ItemsAdvancedFilter } from "./items.filter";
import type { ItemsState } from "./itemState.map";

export type GetItemsFilters = {
  search?         : string | undefined;
  category?       : Exclude<ItemsCategory, '_'>       | undefined;
  state?          : Exclude<ItemsState, '_'>          | undefined;
  advancedFilter? : Exclude<ItemsAdvancedFilter, '_'> | undefined
};