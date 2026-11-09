import type { ContactRelationStatus } from "@shared/maps/filters/contacts/contactRelationStatus.filter";
import type { UserItemResponse } from "./item.dto";

export type ContactResponse = {
  readonly id             : number;
  name                    : string;
  profileImageURL         : string | null;
  joinedAt                : string;
  totalItems              : number;
  loggedUserContactStatus : ContactRelationStatus;
}

export type ContactFromHomeResponse = {
  contacts: {
    readonly id     : number;
    name            : string;
    profileImageURL : string | null;
  }[];

  totalContacts: number;
}

export type ContactDetailsResponse = {
  readonly id             : number;
  name                    : string;
  profileImageURL         : string | null;
  lumberBucks             : number;
  joinedAt                : string;

  totalItems              : number;
  totalContacts           : number;

  loggedUserContactStatus : ContactRelationStatus;

  contacts : {
    readonly id     : number;
    profileImageURL : string | null;
    username        : string;
  }[];

  items : UserItemResponse[];
}