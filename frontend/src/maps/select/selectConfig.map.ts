import { ITEMS_CATEGORY_MAP } from "./filters/ItemCategory.map";
import { ITEMS_STATE_MAP } from "./filters/ItemSubcategory.map";
import { ITEMS_ADVANCED_FILTER_MAP } from "./filters/items.filter";

export const SELECT_CONFIG_MAP = {
  ITEMS_ADVANCED_FILTER    : ITEMS_ADVANCED_FILTER_MAP,
  ITEMS_CATEGORY_FILTER    : ITEMS_CATEGORY_MAP,
  ITEMS_SUBCATEGORY_FILTER : ITEMS_STATE_MAP,
} as const;

export type SelectConfig = keyof typeof SELECT_CONFIG_MAP;