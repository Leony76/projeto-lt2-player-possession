export type Message = {
  readonly id             : number;
  readonly senderId       : number;
  readonly conversationId : number;

  content        : string;
  createdAt      : string;
};


export type InitialChatContact = {
  id              : number;
  username        : string;
  profileImageURL : string | null;
};


export type ConversationListItem = {
  readonly id: number;

  contact: {
    readonly id     : number;
    username        : string;
    profileImageURL : string | null;
  };

  lastMessage: {
    readonly id : number;
    content     : string;
    senderId    : number;
    createdAt   : string;
  } | null;

  updatedAt           : string;
  unreadMessagesCount : number;
};

export type SendMessagePayload = {
  conversationId? : number;
  recipientId?    : number;
  content         : string;
};

export type ConversationsResponse = {
  conversations : ConversationListItem[];
};

export type MessagesResponse = {
  messages: Message[];
};