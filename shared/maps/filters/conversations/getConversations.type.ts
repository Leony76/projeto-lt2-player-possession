import type { ConversationsAdvancedFilterKeys } from "./conversation.filter";

export type ConversationsQuery = {
  search?         : string | undefined;
  advancedFilter? : ConversationsAdvancedFilterKeys | undefined;
  page?           : number;
  limit?          : number;
};