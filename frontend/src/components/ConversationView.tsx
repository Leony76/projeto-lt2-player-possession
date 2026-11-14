import { useEffect, useState } from 'react';
import { IoSend } from 'react-icons/io5';
import Button from './Button';
import styles from './css/ConversationView.module.css';
import type { Message, ConversationListItem } from '@shared/dtos/message.dto';
import { socket } from '@/services/socket.service';
import type { SelectedChat } from '@/types/selectedChat.type';
import { MessageService } from '@/services/message.service';
import profileImagePlaceholder from '@assets/img/profile_image_placeholder.png';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

type Props = {
  selectedChat : SelectedChat;
  onBack       : () => void;

  onConversationCreated: (
    conversation : ConversationListItem,
    message      : Message
  ) => void;
};

export const ConversationView = ({
  selectedChat,
  onBack,
  onConversationCreated,
}: Props): React.JSX.Element => {

  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(
    selectedChat.type === 'EXISTING'
  );

  const contact = selectedChat.type === 'EXISTING'
    ? selectedChat.conversation.contact
    : selectedChat.contact;

  const conversationId = selectedChat.type === 'EXISTING'
    ? selectedChat.conversation.id
    : null;

  useEffect(() => {
    if (conversationId === null) return;

    let isMounted = true;

    const handleNewMessage = (message: Message): void => {
      if (message.conversationId !== conversationId) return;

      setMessages(previous => {
        if (previous.some(item => item.id === message.id)) {
          return previous;
        }

        return [...previous, message];
      });
    };

    socket.on('message:new', handleNewMessage);

    socket.emit('conversation:join', conversationId);
    socket.emit('conversation:read', conversationId);

    const getMessages = async (): Promise<void> => {
      try {
        const response = await MessageService.getMessages(
          conversationId
        );

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

      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    getMessages();

    return () => {
      isMounted = false;

      socket.off('message:new', handleNewMessage);
      socket.emit('conversation:leave', conversationId);
    };
  }, [conversationId]);

  const sendMessage = (): void => {
    const trimmedContent = content.trim();

    if (!trimmedContent) return;

    if (!socket.connected) {
      console.error('Socket is not connected');
      return;
    }

    const payload = conversationId !== null ? {
      conversationId,
      content : trimmedContent,
    } : {
      recipientId : contact.id,
      content     : trimmedContent,
    };

    socket.timeout(10000).emit(
      'message:send',
      payload,
      (
        timeoutError: Error | null,
        response: {
          success: boolean;
          data?: {
            message: Message;
            conversation: ConversationListItem;
          };
          error?: string;
        }
      ) => {

        if (timeoutError) {
          console.error('Server did not respond to message:send');
          return;
        }

        if (!response.success || !response.data) {
          console.error(response.error ?? 'Unable to send message');
          return;
        }

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

  if (!user) return <Navigate to={'/'}/>

  return (
    <div className={styles.conversation_view}>

      <div className={styles.conversation_header}>
        <button onClick={onBack}>
          Back
        </button>

        <img
          src={
            contact.profileImageURL ??
            profileImagePlaceholder
          }
          alt={contact.username}
        />

        <strong>{contact.username}</strong>
      </div>

      <div className={styles.messages_history}>
        {isLoading ? (
          <p>Loading messages...</p>
        ) : messages.length === 0 ? (
          <p>Start a conversation with {contact.username}!</p>
        ) : (
          messages.map(message => (
            <div
            key={message.id}
            className={
              message.senderId === user.id
                ? styles.my_message
                : styles.contact_message
            }
            >
              {message.content}
            </div>
          ))
        )}
      </div>

      <div className={styles.input_send_button_container}>
        <input
          value={content}
          onChange={event => setContent(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter') sendMessage();
          }}
          placeholder={`Message ${contact.username}...`}
        />

        <Button
          buttonStyle="DEFAULT"
          label="Send"
          onClick={sendMessage}
          icon={() => <IoSend size={13} />}
        />
      </div>

    </div>
  );
};