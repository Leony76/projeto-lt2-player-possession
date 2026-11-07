import { CONTACTS_ADVANCED_FILTER_MAP } from "@shared/maps/filters/contacts/contacts.filter";
import { ITEMS_CATEGORY_MAP } from "@shared/maps/filters/items/itemCategory.map";
import { ITEMS_STATE_MAP } from "@shared/maps/filters/items/itemState.map";
import { ITEMS_ADVANCED_FILTER_MAP } from "@shared/maps/filters/items/items.filter";

export const SELECT_CONFIG_MAP = {
  ITEMS_ADVANCED_FILTER : ITEMS_ADVANCED_FILTER_MAP,
  ITEMS_CATEGORY_FILTER : ITEMS_CATEGORY_MAP,
  ITEMS_STATE_FILTER    : ITEMS_STATE_MAP,
  
  CONTACTS_ADVANCED_FILTER : CONTACTS_ADVANCED_FILTER_MAP,
} as const;

export type SelectConfig = keyof typeof SELECT_CONFIG_MAP;