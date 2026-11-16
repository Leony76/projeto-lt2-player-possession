export const CONVERSATIONS_ADVANCED_FILTER_MAP = {
  _ : 'Advanced Filter',

  AZ_CONTACT_NAME : 'Contact name [A-Z]',
  ZA_CONTACT_NAME : 'Contact name [Z-A]',

  MOST_RECENTS_MESSAGES : 'Most recent messages',
  LESS_RECENTS_MESSAGES : 'Less recent messages',
} as const;

export const CONVERSATIONS_ADVANCED_FILTER_MAP_KEYS = Object.keys(
  CONVERSATIONS_ADVANCED_FILTER_MAP
).filter(key => key !== '_') as ConversationsAdvancedFilterKeys[];

export type ConversationsAdvancedFilter = keyof typeof CONVERSATIONS_ADVANCED_FILTER_MAP;
export type ConversationsAdvancedFilterLabel = typeof CONVERSATIONS_ADVANCED_FILTER_MAP[ConversationsAdvancedFilter];
export type ConversationsAdvancedFilterKeys = Exclude<keyof typeof CONVERSATIONS_ADVANCED_FILTER_MAP, '_'>;

