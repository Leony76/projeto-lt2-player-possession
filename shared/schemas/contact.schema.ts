import { CONTACTS_RELATION_STATUS_MAP_KEYS } from "@shared/maps/filters/contacts/contactRelationStatus.filter";
import { CONTACTS_ADVANCED_FILTER_MAP_KEYS } from "@shared/maps/filters/contacts/contacts.filter";
import z from "zod";

export const getContactsQuerySchema = z.object({

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

  advancedFilter: z.enum(CONTACTS_ADVANCED_FILTER_MAP_KEYS).optional(),

  relationStatus: z.enum(CONTACTS_RELATION_STATUS_MAP_KEYS).optional(),

  onlyMyContacts: z.enum(['true', 'false'])
    .optional()
    .transform(value => value === 'true'),
});

export type GetContactsQuery = z.infer<typeof getContactsQuerySchema>;