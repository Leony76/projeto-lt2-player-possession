export type ConversationQueryRow = {
  id        : number;
  updatedAt : Date;

  contactId   : number;
  contactName : string;
  contactProfileImageURL : string | null;

  lastMessageId        : number | null;
  lastMessageContent   : string | null;
  lastMessageSenderId  : number | null;
  lastMessageCreatedAt : Date | null;

  unreadMessagesCount : bigint | number;
};