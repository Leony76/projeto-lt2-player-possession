import { z } from "zod";
import { ITEMS_ADVANCED_FILTER_MAP_KEYS } from "@shared/maps/filters/items/items.filter";
import { ITEMS_CATEGORY_MAP_KEYS } from '../maps/filters/items/itemCategory.map';
import { ITEMS_STATE_MAP_KEYS } from '../maps/filters/items/itemState.map';

export const updateUnitsSchema = z.object({
  units: z
    .number()
    .int('Units must be an integer')
    .refine(Number.isSafeInteger, 'Units must be a safe integer')
    .min(0, 'Units cannot be negative')
    .max(2147483647, 'Units exceed the maximum allowed value'),
});

export const getItemsQuerySchema = z.object({

  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(30),

  search: z.string()
    .trim()
    .transform((value) => value || undefined)
    .optional(),

  category: z.enum(
    Object.values(ITEMS_CATEGORY_MAP_KEYS)).optional(),

  state: z.enum(
    Object.values(ITEMS_STATE_MAP_KEYS)).optional(),

  advancedFilter: z.enum(ITEMS_ADVANCED_FILTER_MAP_KEYS).optional(),
});

export type GetItemsQuery = z.infer<typeof getItemsQuerySchema>;
export type UpdateUnitsFromData = z.infer<typeof updateUnitsSchema>;