import type { ContactsAdvancedFilter } from "./contacts.filter";

export type GetContactsFilters = {
  search?         : string | undefined;
  advancedFilter? : Exclude<ContactsAdvancedFilter, '_'> | undefined
};