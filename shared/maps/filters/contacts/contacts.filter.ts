export const CONTACTS_ADVANCED_FILTER_MAP = {
  _ : 'Advanced Filter',

  AZ_NAME : 'Names [A-Z]',
  ZA_NAME : 'Names [Z-A]',

  MOST_RECENT_JOINS : 'Most recent joins',
  LESS_RECENT_JOINS : 'Less recent joins',

  MOST_ITEMS : 'Most items',
  LESS_ITEMS : 'Less items',

  MOST_LUMBER_BUCKS : 'Most Lumber Bucks',
  LESS_LUMBER_BUCKS : 'Less Lumber Bucks',

  MOST_CONTACTS : 'Most Contacts',
  LESS_CONTACTS : 'Less Contacts',
} as const;

export const CONTACTS_ADVANCED_FILTER_MAP_KEYS = Object.keys(
  CONTACTS_ADVANCED_FILTER_MAP
).filter(key => key !== '_') as ContactsAdvancedFilterKeys[];

export type ContactsAdvancedFilter = keyof typeof CONTACTS_ADVANCED_FILTER_MAP;
export type ContactsAdvancedFilterLabel = typeof CONTACTS_ADVANCED_FILTER_MAP[ContactsAdvancedFilter];
export type ContactsAdvancedFilterKeys = Exclude<keyof typeof CONTACTS_ADVANCED_FILTER_MAP, '_'>;

