import type { ConversationListItem } from "@shared/dtos/message.dto";
import styles from './css/ConversationList.module.css';
import profileImagePlaceholder from '@assets/img/profile_image_placeholder.png';
import { toFormatTimeByDate } from "@/utils/toFormatTimeByDate.util";
import { LoadingState, NotFoundState } from "./ListStates";

type Props = {
  conversations : ConversationListItem[];
  isLoading     : boolean;
  onSelect      : (conversation: ConversationListItem) => void;
};

export const ConversationList = ({
  conversations,
  isLoading,
  onSelect,
}: Props): React.JSX.Element => {

  if (isLoading) {
    return <LoadingState label="conversations"/>
  }

  if (conversations.length === 0) {
    return <NotFoundState label="conversations"/>
  }

  return (
    <div className={styles.conversations_list_container}>
      {conversations.map(conversation => (
        <button
        key={conversation.id}
        className={styles.conversation_card}
        onClick={() => onSelect(conversation)}
        >
          <figure>
            <img
              src={conversation.contact.profileImageURL ?? profileImagePlaceholder}
              alt={conversation.contact.username}
            />
          </figure>

          <div className={styles.username_unread_messages_count_content_container}>
            <div className={styles.username_unread_messages_count_container}>
              <strong>
                {conversation.contact.username}
              </strong>

              {conversation.lastMessage &&
                <span>
                  {toFormatTimeByDate(conversation.lastMessage.createdAt)}
                </span>
              }
            </div>

            <div className={styles.message_unread_messages_count_container}>
              <p>
                {conversation.lastMessage?.content ?? 'No messages yet'}
              </p>
              
              {conversation.unreadMessagesCount > 0 &&
                <span>
                  {conversation.unreadMessagesCount > 99 
                    ? '+99' 
                    : conversation.unreadMessagesCount 
                  }
                </span>
              }
            </div>
          </div> 
        </button>
      ))}
    </div>
  );
};