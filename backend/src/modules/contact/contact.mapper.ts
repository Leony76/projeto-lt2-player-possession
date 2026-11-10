import { ItemCategory, ItemState } from "@backend/generated/prisma/enums.js";
import { ContactDetailsResponse, ContactFromHomeResponse, ContactResponse } from "@shared/dtos/contact.dto.js";
import { ContactRelationStatus } from "@shared/maps/filters/contacts/contactRelationStatus.filter.js";

export class ContactMapper {
  
  public static toContactsResponse(
    data: {
      id: number;
      name: string;
      profileImageURL: string | null;
      joinedAt: Date;
      totalItems: number;
      loggedUserContactStatus: string;
    }[],
  ): ContactResponse[] {

    return data.map(contact => ({
      id              : contact.id,
      name            : contact.name,
      profileImageURL : contact.profileImageURL,
      joinedAt        : contact.joinedAt.toISOString(),
      totalItems      : contact.totalItems,
      loggedUserContactStatus : contact.loggedUserContactStatus as ContactRelationStatus,
    }));
  }



  public static toContactDetailsResponse(
    data : {
      id   : number;
      name : string;
      profileImageURL : string | null;
      lumberBucks : number;
      joinedAt    : Date;
      totalItems  : number;
      totalContacts           : number;
      loggedUserContactStatus : string;

      contacts: {
        id              : number;
        profileImageURL : string | null;
        username        : string;
      }[];

      items: {
        units       : number;
        id          : number;
        description : string | null;
        name        : string;
        category    : ItemCategory;
        state       : ItemState;
        originalPrice      : number | null;
        averageMarketPrice : number | null;
        imageURL           : string;
      }[];
    }
  ): ContactDetailsResponse {
    return {
      ...data,
      joinedAt : data.joinedAt.toISOString(),
      loggedUserContactStatus : data.loggedUserContactStatus as ContactRelationStatus,
      items : data.items.map((item) => ({
        ...item,
        originalPrice: item.originalPrice ?? -1
      })),
    }
  }



  public static toContactFromHomeResponse(
    data: {
      id              : number;
      name            : string;
      profileImageURL : string | null;
      joinedAt        : Date;
      totalContacts   : bigint;
    }[],
  ): ContactFromHomeResponse {
    return {
      contacts: data.map(contact => ({
        id: contact.id,
        name: contact.name,
        profileImageURL: contact.profileImageURL,
      })),

      totalContacts: Number(data[0]?.totalContacts ?? 0n),
    };
  }
}