export type Message = {
  readonly id             : number;
  readonly senderId       : number;
  readonly conversationId : number;

  content        : string;
  createdAt      : string;
};
