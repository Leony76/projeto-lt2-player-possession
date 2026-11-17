import { useAuth } from "@/contexts/AuthContext";
import { MessageService } from "@/services/message.service";
import { socket } from "@/services/socket.service";
import type { SelectedChat } from "@/types/selectedChat.type";
import type { ConversationListItem, Message } from "@shared/dtos/message.dto";
import { useEffect, useRef, useState } from "react";

type Props = {
  selectedChat : SelectedChat;
  onConversationCreated: (
    conversation : ConversationListItem,
    message      : Message
  ) => void;
}

export const useConversationView = ({
  onConversationCreated,
  selectedChat,
}: Props) => {

  const { user } = useAuth();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasLoadedMessagesRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sendMessageError, setSendMessageError] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState<string>('');
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(socket.connected);
  const [isLoading, setIsLoading] = useState<boolean>(
    selectedChat.type === 'EXISTING'
  );
  
  const contact = selectedChat.type === 'EXISTING'
    ? selectedChat.conversation.contact
    : selectedChat.contact
  ;

  const conversationId = selectedChat.type === 'EXISTING'
    ? selectedChat.conversation.id
    : null
  ;



  const handleSendMessage = (): void => {
    const trimmedContent = content.trim();

    if (!trimmedContent) return;

    if (!isSocketConnected || !socket.connected) {
      setSendMessageError('Socket is not connected yet');
      return;
    }

    // Limpa o erro anterior ao tentar novamente
    setSendMessageError(null);

    const payload = conversationId !== null
      ? {
          conversationId,
          content: trimmedContent,
        }
      : {
          recipientId: contact.id,
          content: trimmedContent,
        };

    socket.timeout(10000).emit(
      'message:send',
      payload,
      (
        timeoutError: Error | null,
        response: {
          success: boolean;
          data?: {
            message      : Message;
            conversation : ConversationListItem;
          };
          error?: string;
        }
      ) => {
        if (timeoutError) {
          setSendMessageError('Server did not respond. Please try again.');
          return;
        }

        if (!response.success || !response.data) {
          setSendMessageError(
            response.error ?? 'Unable to send message'
          );
          return;
        }

        setSendMessageError(null);
        setContent('');

        if (conversationId === null) {
          onConversationCreated(
            response.data.conversation,
            response.data.message
          );
        }
      }
    );
  };



  useEffect(() => {

    const handleConnect = (): void => {
      console.log('Socket connected:', socket.id);
      setIsSocketConnected(true);
    };

    const handleDisconnect = (): void => {
      console.log('Socket disconnected');
      setIsSocketConnected(false);
    };

    const handleConnectError = (error: Error): void => {
      console.error('Socket connection error:', error.message);
      setIsSocketConnected(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    if (socket.connected) {
      setIsSocketConnected(true);
    } else {
      socket.connect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, []);



  useEffect(() => {
    if (conversationId === null) return;

    let isMounted = true;
    hasLoadedMessagesRef.current = false;

    const markConversationAsRead = (): void => {
      if (
        socket.connected &&
        hasLoadedMessagesRef.current
      ) {
        socket.emit('conversation:read', conversationId);
      }
    };

    const handleNewMessage = (message: Message): void => {
      if (message.conversationId !== conversationId) return;

      setMessages(previous => {
        if (previous.some(item => item.id === message.id)) {
          return previous;
        }

        return [...previous, message];
      });


      if (message.senderId !== user?.id) {
        markConversationAsRead();
      }
    };

    const joinConversation = (): void => {
      socket.emit('conversation:join', conversationId);
      markConversationAsRead();
    };

    socket.on('message:new', handleNewMessage);
    socket.on('connect', joinConversation);

    if (socket.connected) {
      joinConversation();
    }

    const getMessages = async (): Promise<void> => {
      try {
        const response = await MessageService.get(conversationId);

        if (!isMounted) return;

        setMessages(previous => {
          const merged = [
            ...previous,
            ...response.messages,
          ];

          return Array.from(
            new Map(
              merged.map(message => [message.id, message])
            ).values()
          ).sort(
            (a, b) =>
              new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime()
          );
        });

        hasLoadedMessagesRef.current = true;
        markConversationAsRead();

      } catch (error: unknown) {
        console.error(error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    getMessages();

    return () => {
      isMounted = false;
      hasLoadedMessagesRef.current = false;

      socket.off('message:new', handleNewMessage);
      socket.off('connect', joinConversation);

      if (socket.connected) {
        socket.emit('conversation:leave', conversationId);
      }
    };
  }, [conversationId, user?.id]);



  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`;
  }, [content]);



  useEffect(() => {
    if (isLoading) return;

    messagesEndRef.current?.scrollIntoView({
      behavior : 'smooth',
      block    : 'end',
    });
  }, [messages, isLoading]);



  return {
    user,

    states: {
      contact,
      isLoading,
      messages,
      content,
      isSocketConnected,
      sendMessageError,
    },

    refs: {
      messagesEndRef,
      textareaRef,
    },

    setters: {
      setContent,
    },

    handlers: {
      handleSendMessage,
    }
  }
}