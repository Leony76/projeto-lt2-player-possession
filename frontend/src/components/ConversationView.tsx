import { IoSend } from 'react-icons/io5';
import Button from './Button';
import styles from './css/ConversationView.module.css';
import animations from '@assets/css/Animations.module.css';
import type { Message, ConversationListItem } from '@shared/dtos/message.dto';
import type { SelectedChat } from '@/types/selectedChat.type';
import profileImagePlaceholder from '@assets/img/profile_image_placeholder.png';
import { Navigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { toFormatTimeByDate } from '@/utils/toFormatTimeByDate.util';
import { LoadingState } from './ListStates';
import { useConversationView } from '@/hooks/useConversationView.hook';
import ErrorMessage from './ErrorMessage';

type Props = {
  onBack       : () => void;
  
  selectedChat : SelectedChat;
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

  const { user, states, refs, setters, handlers } = useConversationView({
    onConversationCreated,
    selectedChat,
  });

  if (!user) return <Navigate to={'/'}/>

  return (
    <div className={styles.conversation_view_container}>
      <div className={styles.conversation_header}>
        <button onClick={onBack}>
          <FaArrowLeft />
        </button>

        <figure>
          <img
            alt={states.contact.username}
            src={
              states.contact.profileImageURL ??
              profileImagePlaceholder
            }
          />
        </figure>

        <strong>
          { states.contact.username }
        </strong>
      </div>

      <div className={styles.messages_history_container}>
        {states.isLoading ? (
          <div style={{ margin: '8px 0px' }}>
            <LoadingState label="messages"/>
          </div>
        ) : states.messages.length === 0 ? (
          <p className={styles.start_conversation}>
            Start a conversation with {states.contact.username}!
          </p>
        ) : (
          states.messages.map((message, index) => (
            <div
            key={message.id}
            style={{ animationDelay: `${index * 10}ms` }}
            className={`${message.senderId === user.id
              ? styles.my_message
              : styles.contact_message
            } ${animations.fade_in}`}
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

        <div ref={refs.messagesEndRef} style={{ marginTop: '-7px' }}/>
      </div>

      <div className={styles.input_send_button_container}>
        <textarea
          ref={refs.textareaRef}
          value={states.content}
          maxLength={1000}
          onChange={event => setters.setContent(event.target.value)}
          placeholder={`Message ${states.contact.username}...`}
          rows={1}
          onKeyDown={event => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              handlers.handleSendMessage();
            }
          }}
        />

        <div>
          <Button
            buttonStyle="DEFAULT"
            disabled={!states.isSocketConnected || states.content.trim().length <= 0}
            label="Send"
            onClick={handlers.handleSendMessage}
            icon={() => <IoSend size={13} />}  
            colors={{
              background: 'darkgoldenrod',
              labelBorder: 'yellow'
            }}      
          />
        </div>
      </div>
      
      {states.content.trim().length > 0 &&
        <span 
        data-max={states.content.trim().length >= 1000}
        className={styles.message_length_indicator}
        >
          { states.content.trim().length } / 1000
        </span>
      }

      {states.sendMessageError && 
        <ErrorMessage error={states.sendMessageError}/>
      }
    </div>
  );
};