import type { ContactRelationStatus } from "@shared/types/contactRelationStatus.type";

export type ContactResponse = {
  readonly id             : number;
  name                    : string;
  profileImageURL         : string | null;
  joinedAt                : string;
  totalItems              : number;
  loggedUserContactStatus : ContactRelationStatus;
}