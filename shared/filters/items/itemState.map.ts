export const ITEMS_STATE_MAP = {
  _     : 'State',
  BOXED : 'Boxed',
  GIFT  : 'Gift',
  LOOSE : 'Loose',
} as const;

export type ItemsState = keyof typeof ITEMS_STATE_MAP;
export type ItemsStateLabel = typeof ITEMS_STATE_MAP[ItemsState];




