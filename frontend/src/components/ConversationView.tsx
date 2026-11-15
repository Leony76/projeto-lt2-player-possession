import { useEffect, useRef, useState } from 'react';
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
import { FaArrowLeft } from 'react-icons/fa';
import { toFormatTimeByDate } from '@/utils/toFormatTimeByDate.util';
import { LoadingState } from './ListStates';

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

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasLoadedMessagesRef = useRef(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState<string>('');
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(socket.connected);
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
        const response = await MessageService.getMessages(conversationId);

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



  const sendMessage = (): void => {
    const trimmedContent = content.trim();

    if (!trimmedContent) return;

    if (!isSocketConnected || !socket.connected) {
      console.error('Socket is not connected yet');
      return;
    }

    const payload = conversationId !== null
    ? {
        conversationId,
        content: trimmedContent,
      }
    : {
        recipientId: contact.id,
        content: trimmedContent,
      }
    ;

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
    <div className={styles.conversation_view_container}>
      <div className={styles.conversation_header}>
        <button onClick={onBack}>
          <FaArrowLeft />
        </button>

        <figure>
          <img
            alt={contact.username}
            src={
              contact.profileImageURL ??
              profileImagePlaceholder
            }
          />
        </figure>

        <strong>
          { contact.username }
        </strong>
      </div>

      <div className={styles.messages_history_container}>
        {isLoading ? (
          <LoadingState label='messages'/>
        ) : messages.length === 0 ? (
          <p className={styles.start_conversation}>
            Start a conversation with {contact.username}!
          </p>
        ) : (
          messages.map(message => (
            <div
            key={message.id}
            className={message.senderId === user.id
              ? styles.my_message
              : styles.contact_message
            }
            >
              <p>
                { message.content }
              </p>
              
              <span>
                { toFormatTimeByDate(message.createdAt) }
              </span>
            </div>
          ))
        )}
      </div>

      <div className={styles.input_send_button_container}>
        <textarea
          ref={textareaRef}
          value={content}
          maxLength={1000}
          onChange={event => setContent(event.target.value)}
          placeholder={`Message ${contact.username}...`}
          rows={1}
          onKeyDown={event => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              sendMessage();
            }
          }}
        />

        <div>
          <Button
            buttonStyle="DEFAULT"
            disabled={!isSocketConnected || content.trim().length <= 0}
            label="Send"
            onClick={sendMessage}
            icon={() => <IoSend size={13} />}  
            colors={{
              background: 'darkgoldenrod',
              labelBorder: 'yellow'
            }}      
          />
        </div>
      </div>
      
      {content.trim().length > 0 &&
        <span 
        data-max={content.trim().length >= 1000}
        className={styles.message_length_indicator}
        >
          { content.trim().length } / 1000
        </span>
      }
    </div>
  );
};