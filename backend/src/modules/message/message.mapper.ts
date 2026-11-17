import { InitialChatContact } from "@shared/dtos/message.dto.js";

export class MessageMapper {

  public static toContactFormat(
    contact: {
      id              : number;
      name            : string;
      profileImageURL : string | null;
    },
  ): InitialChatContact {
    return {
      id              : contact.id,
      username        : contact.name,
      profileImageURL : contact.profileImageURL,
    };
  }
}