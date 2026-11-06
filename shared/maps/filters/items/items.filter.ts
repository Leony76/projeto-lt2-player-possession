export const ITEMS_ADVANCED_FILTER_MAP = {
  _ : 'Advanced Filter',

  AZ_NAME : 'Names [A-Z]',
  ZA_NAME : 'Names [Z-A]',

  MOST_RECENTS : 'Most recents',
  LESS_RECENTS : 'Less recents',

  HIGHEST_ORIGINAL_PRICE: 'Highest original price',
  LOWEST_ORIGINAL_PRICE : 'Lowest original price' ,

  HIGHEST_MARKET_PRICE: 'Highest market price',
  LOWEST_MARKET_PRICE : 'Lowest market price' ,
} as const

export const ITEMS_ADVANCED_FILTER_MAP_KEYS = Object.keys(
  ITEMS_ADVANCED_FILTER_MAP
).filter(key => key !== '_') as ItemsAdvancedFilterKeys[];

export type ItemsAdvancedFilter = keyof typeof ITEMS_ADVANCED_FILTER_MAP;
export type ItemsAdvancedFilterLabel = typeof ITEMS_ADVANCED_FILTER_MAP[ItemsAdvancedFilter];
export type ItemsAdvancedFilterKeys = Exclude<keyof typeof ITEMS_ADVANCED_FILTER_MAP, '_'>;