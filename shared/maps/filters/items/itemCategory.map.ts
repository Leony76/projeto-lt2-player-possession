export const ITEMS_CATEGORY_MAP = {
  _              : 'Category',
  AXE            : 'Axe',
  BALL           : 'Ball',
  BOOK           : 'Book',
  CANDY          : 'Candy',
  CANDY_CANE     : 'Candy Cane',
  FOOD           : 'Food',
  FINE_ART       : 'Fine Art',
  GAME           : 'Game',
  HOME           : 'Home',
  PUMPKIN        : 'Pumpkin',
  WOBBLE_BOBBLE  : 'Wobble Bobble',
  VEHICLE        : 'Vehicle',
  MISCELLANEOUS  : 'Miscellaneous',
  CONVEYOR       : 'Conveyor',
  LOGIC          : 'Logic',
  WOOD           : 'Wood',
} as const;

export type ItemsCategory = keyof typeof ITEMS_CATEGORY_MAP;
export type ItemsCategoryLabel = typeof ITEMS_CATEGORY_MAP[ItemsCategory];

export const ITEMS_CATEGORY_MAP_KEYS = Object.keys(ITEMS_CATEGORY_MAP)
  .filter((key) => key !== '_') as Exclude<ItemsCategory, '_'>[]
;
