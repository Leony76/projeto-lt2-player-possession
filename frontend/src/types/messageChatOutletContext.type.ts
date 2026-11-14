export type MessageChatOutletContext = {
  openCloseMessageChat : () => void;

  openConversationWithContact: (
    contact: {
      id              : number;
      username        : string;
      profileImageURL : string | null;
    }
  ) => void;
}