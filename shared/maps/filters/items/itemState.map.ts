export const ITEMS_STATE_MAP = {
  _     : 'State',
  BOXED : 'Boxed',
  GIFT  : 'Gift',
  LOOSE : 'Loose',
} as const;

export type ItemsState = keyof typeof ITEMS_STATE_MAP;
export type ItemsStateLabel = typeof ITEMS_STATE_MAP[ItemsState];

export const ITEMS_STATE_MAP_KEYS = Object.keys(ITEMS_STATE_MAP)
  .filter((key) => key !== '_') as Exclude<ItemsState, '_'>[];




