import { ContactResponse } from "@shared/dtos/contact.dto.js";
import { ContactRelationStatus } from "@shared/types/contactRelationStatus.type.js";

export class ContactMapper {
  
  public static toContactsResponse(
    data: {
      id: number;
      name: string;
      profileImageURL: string | null;
      joinedAt: Date;
      totalItems: number;
      lumberBucks: number;
      totalContacts: number;
      loggedUserContactStatus: string;
    }[],
  ): ContactResponse[] {

    return data.map(contact => ({
      id: contact.id,
      name: contact.name,
      profileImageURL: contact.profileImageURL,

      joinedAt: contact.joinedAt.toISOString(),

      totalItems: contact.totalItems,
      lumberBucks: contact.lumberBucks,
      totalContacts: contact.totalContacts,

      loggedUserContactStatus:
        contact.loggedUserContactStatus as ContactRelationStatus,
    }));
  }
}