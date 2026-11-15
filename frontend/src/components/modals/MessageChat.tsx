import { MessageService } from "@/services/message.service";
import { useEffect, useState } from "react";
import styles from '../css/MessageChat.module.css';
import type { ConversationListItem, InitialChatContact } from "@shared/dtos/message.dto";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { ConversationList } from "../ConversationList";
import { ConversationView } from "../ConversationView";
import type { SelectedChat } from "@/types/selectedChat.type";
import { useAuth } from "@/contexts/AuthContext";
import { socket } from "@/services/socket.service";

type Props = {
  initialContact : InitialChatContact | null;
  isMinimized    : boolean;
  closeChat      : () => void;
  setIsMinimized : React.Dispatch<React.SetStateAction<boolean>>;
};

export const MessageChat = ({
  closeChat,
  initialContact,
  isMinimized,
  setIsMinimized,
}: Props): React.JSX.Element => {

  const { user } = useAuth();

  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [selectedChat, setSelectedChat] = useState<SelectedChat | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const getConversations = async (): Promise<void> => {
      setIsLoading(true);

      setSelectedChat(initialContact 
        ? {
          type: 'NEW',
          contact: initialContact,
        } : null
      );

      try {
        const response = await MessageService.getConversations();

        if (!isMounted) return;

        setConversations(response.conversations);

        if (initialContact) {
          const existingConversation = response.conversations.find(
            conversation => conversation.contact.id === initialContact.id
          );

          setSelectedChat(existingConversation
            ? {
                type: 'EXISTING',
                conversation: existingConversation,
              }
            : {
                type: 'NEW',
                contact: initialContact,
              }
          );
        }
      } catch (error : unknown) {
        console.error('Unable to get conversations:', error);
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
  }, [initialContact]);



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
    const handleConversationRead = (data: {
      conversationId: number;
    }): void => {
      setConversations(previous =>
        previous.map(conversation =>
          conversation.id === data.conversationId
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

  useEffect(() => {
    const handleConversationRead = (conversationId: number) => {
      setConversations(previous =>
        previous.map(conversation =>
          conversation.id === conversationId ? {
            ...conversation,
            unreadMessagesCount: 0,
          } : conversation
        )
      );
    };

    socket.on('conversation:read', handleConversationRead);

    return () => {
      socket.off('conversation:read', handleConversationRead);
    };
  }, []);

  const handleBack = (): void => {
    setSelectedChat(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.title_close_minimize_chat_container}>
        <h3>
          {selectedChat
            ? selectedChat.type === 'EXISTING'
              ? 'Messages'
              : 'Conversations'
            : 'Conversations'}
        </h3>

        <div className={styles.close_minimize_chat_container}>
          <button
          onClick={() => setIsMinimized(prev => !prev)}
          className={styles.chevron_down}
          >
            {isMinimized
              ? <FaChevronUp size={15} />
              : <FaChevronDown />}
          </button>

          <button
          onClick={closeChat}
          className={styles.close}
           >
            <IoClose size={16} />
          </button>
        </div>
      </div>

      <div className={`
        ${styles.content_panel}
        ${isMinimized ? styles.minimized : ''}
      `}>
        <div className={styles.content_inner}>
          {selectedChat ? (
            <ConversationView
              key={selectedChat.type === 'EXISTING'
                ? `conversation-${selectedChat.conversation.id}`
                : `new-${selectedChat.contact.id}`
              }
              selectedChat={selectedChat}
              onBack={handleBack}
              onConversationCreated={(conversation, message) => {
                setConversations(previous => {
                  const withoutDuplicate = previous.filter(
                    item => item.id !== conversation.id
                  );

                  return [
                    {
                      ...conversation,
                      lastMessage: message,
                    },
                    ...withoutDuplicate,
                  ];
                });

                setSelectedChat({
                  type: 'EXISTING',
                  conversation: {
                    ...conversation,
                    lastMessage: message,
                  },
                });
              }}
            />
          ) : (
            <ConversationList
              conversations={conversations}
              isLoading={isLoading}
              onSelect={conversation =>
                setSelectedChat({
                  type: 'EXISTING',
                  conversation,
                })
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};