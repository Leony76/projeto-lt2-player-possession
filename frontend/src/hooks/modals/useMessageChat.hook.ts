import { CONVERSATIONS_PER_PAGE } from "@/consts/conversationsParPage.const";
import { useAuth } from "@/contexts/AuthContext";
import { ConversationService } from "@/services/conversation.service";
import { socket } from "@/services/socket.service";
import type { SelectedChat } from "@/types/selectedChat.type";
import type { ConversationListItem, InitialChatContact } from "@shared/dtos/message.dto";
import type { ConversationsAdvancedFilterKeys } from "@shared/maps/filters/conversations/conversation.filter";
import { useCallback, useEffect, useRef, useState } from "react";

export const useMessageChat = (initialContact : InitialChatContact | null) => {

  const { user } = useAuth();
  
  const contentPanelRef = useRef<HTMLDivElement>(null);
  const isFetchingMoreRef = useRef<boolean>(false);
  const handledInitialContactRef = useRef<number | null>(null);

  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [selectedChat, setSelectedChat] = useState<SelectedChat | null>(null);

  const [search, setSearch] = useState("");
  const [advancedFilter, setAdvancedFilter] = useState<ConversationsAdvancedFilterKeys>(
    "MOST_RECENTS_MESSAGES",
  );

  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);



  const loadMoreConversations = useCallback(async (): Promise<void> => {
    if (
      isLoading                 ||
      isLoadingMore             ||
      isFetchingMoreRef.current ||
      !hasMore                  ||
      selectedChat
    ) {
      return;
    }

    isFetchingMoreRef.current = true;
    setIsLoadingMore(true);

    const nextPage = page + 1;

    try {
      const response = await ConversationService.get({
        search,
        advancedFilter,
        page  : nextPage,
        limit : CONVERSATIONS_PER_PAGE,
      });

      setConversations(previous => {
        const existingIds = new Set(
          previous.map(conversation => conversation.id),
        );

        const newConversations = response.items.filter(
          conversation => !existingIds.has(conversation.id),
        );

        return [...previous, ...newConversations];
      });

      setPage(nextPage);
      setHasMore(response.pagination.hasMore);
    } catch (error: unknown) {
      console.error("Unable to load more conversations:", error);
    } finally {
      isFetchingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, [
    page,
    search,
    advancedFilter,
    hasMore,
    isLoading,
    isLoadingMore,
    selectedChat,
  ]);



  const handleConversationScroll = (): void => {
    const container = contentPanelRef.current;

    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    if (isNearBottom) loadMoreConversations();
  };



  const handleBack = (): void => {
    setSelectedChat(null);
  };



  useEffect(() => {
    let isMounted = true;

    const getConversations = async (): Promise<void> => {
      setIsLoading(true);
      setPage(1);
      setHasMore(false);
      setConversations([]);

      try {
        const response = await ConversationService.get({
          search,
          advancedFilter,
          page: 1,
          limit: CONVERSATIONS_PER_PAGE,
        });

        if (!isMounted) return;

        setConversations(response.items);
        setHasMore(response.pagination.hasMore);

      } catch (error: unknown) {
        console.error("Unable to get conversations:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    getConversations();

    return () => {
      isMounted = false;
    };
  }, [search, advancedFilter]);



  useEffect(() => {
    if (!initialContact) {
      handledInitialContactRef.current = null;
      return;
    }

    if (handledInitialContactRef.current === initialContact.id) {
      return;
    }

    handledInitialContactRef.current = initialContact.id;

    const initializeChat = async (): Promise<void> => {
      try {
        const response = await ConversationService.get({
          search : "",
          advancedFilter: "MOST_RECENTS_MESSAGES",
          page  : 1,
          limit : CONVERSATIONS_PER_PAGE,
        });

        const existingConversation = response.items.find(
          conversation => conversation.contact.id === initialContact.id,
        );

        setSelectedChat(
          existingConversation
          ? {
              type: "EXISTING",
              conversation: existingConversation,
            }
          : {
              type: "NEW",
              contact: initialContact,
            }
          ,
        );
      } catch (error: unknown) {
        console.error("Unable to initialize chat:", error);
      }
    };

    initializeChat();
  }, [initialContact?.id]);



  useEffect(() => {
    if (!user) {
      socket.disconnect();
      return;
    }

    const handleConnect = (): void => {
      console.log('Socket connected:', socket.id);
    };

    const handleConnectError = (error: Error): void => {
      console.error('Socket connection error:', error.message);
    };

    socket.on('connect', handleConnect);
    socket.on('connect_error', handleConnectError);

    socket.disconnect();
    socket.connect();

    return () => {
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleConnectError);
    };
  }, [user?.id]);



  useEffect(() => {
    const handleConversationRead = (
      conversationId: number
    ): void => {
      if (typeof conversationId !== 'number') {
        console.error('Invalid conversationId:', conversationId);
        return;
      }

      setConversations(previous =>
        previous.map(conversation =>
          conversation.id === conversationId
            ? {
                ...conversation,
                unreadMessagesCount: 0,
              }
            : conversation
        )
      );
    };

    socket.on('conversation:read', handleConversationRead);

    return () => {
      socket.off('conversation:read', handleConversationRead);
    };
  }, []);



  useEffect(() => {
    const handleConversationUpdated = (
      updatedConversation : ConversationListItem
    ) => {
      setConversations(previous => {
        const exists = previous.some(
          conversation => conversation.id === updatedConversation.id
        );

        if (!exists) {
          return [updatedConversation, ...previous];
        }

        return previous
          .map(conversation =>
            conversation.id === updatedConversation.id
              ? {
                  ...conversation,
                  lastMessage: updatedConversation.lastMessage,
                  updatedAt: updatedConversation.updatedAt,
                  unreadMessagesCount:
                    updatedConversation.unreadMessagesCount,
                }
              : conversation
          )
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() -
              new Date(a.updatedAt).getTime()
          );
      });
    };

    socket.on('conversation:updated', handleConversationUpdated);

    return () => {
      socket.off('conversation:updated', handleConversationUpdated);
    };
  }, []);

  return {
    states: {
      selectedChat,
      search,
      advancedFilter,
      conversations,
      isLoadingMore,
      isLoading,
    },

    setters: {
      setSearch,
      setAdvancedFilter,
      setConversations,
      setSelectedChat,
    },

    handlers: {
      handleBack,
      handleConversationScroll,
      handledInitialContactRef,
    },

    refs: {
      contentPanelRef,
    }
  }
}