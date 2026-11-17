import { CONVERSATIONS_PER_PAGE } from "@/consts/conversationsParPage.const";
import { CONVERSATIONS_ADVANCED_FILTER_MAP_KEYS } from "@shared/maps/filters/conversations/conversation.filter";
import { z } from "zod";

export const getConversationsQuerySchema = z.object({

  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1)
  ,

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(50)
    .default(CONVERSATIONS_PER_PAGE)
  ,

  search: z.string()
    .trim()
    .transform(value => value || undefined)
    .optional()
  ,

  advancedFilter: z.enum(CONVERSATIONS_ADVANCED_FILTER_MAP_KEYS).default("MOST_RECENTS_MESSAGES"),
});

export type GetConversationsQuery = z.infer<typeof getConversationsQuerySchema>;