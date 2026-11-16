import { CONVERSATIONS_PER_PAGE } from "@/consts/conversationsParPage.const";
import { useAuth } from "@/contexts/AuthContext";
import { ContactService } from "@/services/contact.service";
import { ConversationService } from "@/services/conversation.service";
import { socket } from "@/services/socket.service";
import { handleAxiosError } from "@/utils/handleAxiosError.util";
import type { InitialChatContact } from "@shared/dtos/message.dto";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const useLayout = () => {

  const { user, signOut, loading } = useAuth();

  const location = useLocation();

  const [isAsideCollapsed, setIsAsideCollapsed] = useState<boolean>(false);

  const [initialChatContact, setInitialChatContact] = useState<InitialChatContact | null>(null);
  const [isMessageChatOpen, setIsChatMessageOpen] = useState<boolean>(false);
  const [isMessageChatMinimized, setIsMessageChatMinimized] = useState<boolean>(false);

  
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);
  const [receivedContactRequestsCount, setReceivedContactRequestsCount] = useState<number>(0);

  const currentTab = {
    '/home'        : 'HOME',
    '/items'       : 'ITEMS',
    '/my-items'    : 'MY_ITEMS',
    '/contacts'    : 'CONTACTS',
    '/my-contacts' : 'MY_CONTACTS',
    '/about'       : 'ABOUT',
  } as const;

  const tab = currentTab[location.pathname as keyof typeof currentTab];
  const iconSizeByCollapedStatus = isAsideCollapsed ? 1.4 : 1;



  const openCloseMessageChat = (): void => {
    setIsChatMessageOpen(prev => !prev);
  }



  const openConversationWithContact = (
    contact: InitialChatContact
  ): void => {
    setInitialChatContact({ ...contact });
    setIsChatMessageOpen(true);
    setIsMessageChatMinimized(false);
  };



  const handleCloseMessageChat = (): void => {
    setIsChatMessageOpen(false);
    setInitialChatContact(null);
  };



  const decrementReceivedContactRequestsCount = (): void => {
    setReceivedContactRequestsCount(prev => Math.max(0, prev - 1));
  };



  const getUnreadMessagesCount = async (): Promise<void> => {
    try {
      const response = await ConversationService.get({
        page  : 1,
        limit : CONVERSATIONS_PER_PAGE
      });

      const total = response.items.reduce(
        (accumulator, conversation) =>
          accumulator + conversation.unreadMessagesCount, 0
      );

      setUnreadMessagesCount(total);

    } catch (error: unknown) {
      console.error('Unable to get unread messages count:', error);
    }
  };



  useEffect(() => {
    if (!user) return;

    const savedPreference = localStorage.getItem(
      `asideCollapsed_${user.id}`
    );

    setIsAsideCollapsed(savedPreference === 'true');

  }, [user?.id]);



  useEffect(() => {
    if (!user) return;

    localStorage.setItem(
      `asideCollapsed_${user.id}`, 
      String(isAsideCollapsed)
    );

  }, [isAsideCollapsed, user?.id]);



  useEffect(() => {
    const handleConversationRead = (): void => {
      getUnreadMessagesCount();
    };

    socket.on('conversation:read', handleConversationRead);

    return () => {
      socket.off('conversation:read', handleConversationRead);
    };
  }, []);



  useEffect(() => {
    const handleConversationUpdated = (): void => {
      getUnreadMessagesCount();
    };

    socket.on('conversation:updated', handleConversationUpdated);

    return () => {
      socket.off('conversation:updated', handleConversationUpdated);
    };
  }, []);



  useEffect(() => {
    if (!user) return;

    const getReceivedRequestsCount = async () => {
      try {
        const response = await ContactService.getReceivedContactRequestsCount();

        setReceivedContactRequestsCount(response.count);

      } catch (error:unknown) {
        console.error(handleAxiosError(error));
      }
    };

    getReceivedRequestsCount();
    getUnreadMessagesCount();

    const interval = setInterval(() => {
      getReceivedRequestsCount();
      getUnreadMessagesCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.id]);


  
  return {
    user,
    signOut,

    states: {
      tab,
      iconSizeByCollapedStatus,
      receivedContactRequestsCount,
      isMessageChatOpen,
      initialChatContact,
      isMessageChatMinimized,
      unreadMessagesCount,
      isAsideCollapsed,
      loading,
    },
    
    handlers :{
      handleCloseMessageChat,
      openCloseMessageChat,
      openConversationWithContact,
      decrementReceivedContactRequestsCount,
    },
    
    setters: {
      setIsMessageChatMinimized,
      setInitialChatContact,
      setIsChatMessageOpen,
      setIsAsideCollapsed,
    },
  }
}