import type { ContactRelationStatus } from "@shared/maps/filters/contacts/contactRelationStatus.filter";
import type { ContactsAdvancedFilter } from "./contacts.filter";

export type GetContactsFilters = {
  search?         : string | undefined;
  advancedFilter? : Exclude<ContactsAdvancedFilter, '_'> | undefined;
  relationStatus? : ContactRelationStatus;
  onlyMyContacts? : boolean;
};