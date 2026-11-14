import type { ConversationListItem } from "@shared/dtos/message.dto";

export type SelectedChat = | {
  type : 'EXISTING';

  conversation : ConversationListItem;
} | {
  type : 'NEW';

  contact: {
    readonly id     : number;
    username        : string;
    profileImageURL : string | null;
  };
};