import { useEffect, useState } from 'react';
import styles from '../css/MessageChat.module.css'; 
import { socket } from '@/services/socket.service';
import type { Message } from '@shared/dtos/message.dto';
import Button from '../Button';
import { IoClose, IoSend } from 'react-icons/io5';

type Props = {
  conversationId   : number;
  closeMessageChat : () => void;
};

export const MessageChat = ({ 
  conversationId,
  closeMessageChat,
}: Props): React.JSX.Element => {

  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');

  useEffect(() => {
    socket.emit('conversation:join', conversationId);

    const handleNewMessage = (
      message : Message
    ) => {

      if (message.conversationId !== conversationId) return;

      setMessages((previous) => {
        if (previous.some((item) => item.id === message.id)) {
          return previous;
        }

        return [...previous, message];
      });
    };

    socket.on('message:new', handleNewMessage);

    return () => {
      socket.off('message:new', handleNewMessage);

      socket.emit('conversation:leave', conversationId);
    };
  }, [conversationId]);

  const sendMessage = () => {
    if (!content.trim()) return;

    socket.emit(
      'message:send',
      {
        conversationId,
        content,
      },
      (response: {
        success: boolean;
        data?: Message;
      }) => {
        if (response.success) {
          setContent('');
        }
      }
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.messages_history}>
        {messages.map((message) => (
          <p 
          key={message.id}
          >
            { message.content }
          </p>
        ))}

        <button onClick={closeMessageChat}>
          <IoClose />
        </button>
      </div>

      <div className={styles.input_send_button_container}>
        <input
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        
        <div>
          <Button
            buttonStyle='DEFAULT'
            label='Send'
            onClick={sendMessage}
            icon={() => <IoSend size={13}/>}
            iconPosition={{
              bottom: '-1px'
            }}
            colors={{
              background: 'rgb(184, 135, 11)',
              labelBorder: 'rgb(255, 240, 201)',
            }}
          />
        </div>
      </div>
    </div>
  );
}