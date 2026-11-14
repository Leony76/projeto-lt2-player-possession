import type { ConversationListItem } from "@shared/dtos/message.dto";
import styles from './css/ConversationList.module.css';
import profileImagePlaceholder from '@assets/img/profile_image_placeholder.png';

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
    return <p>Loading conversations...</p>;
  }

  if (conversations.length === 0) {
    return <p>No conversations yet.</p>;
  }

  return (
    <div className={styles.conversations_list}>
      {conversations.map(conversation => (
        <button
        key={conversation.id}
        className={styles.conversation_card}
        onClick={() => onSelect(conversation)}
        >
          <img
            src={conversation.contact.profileImageURL ?? profileImagePlaceholder}
            alt={conversation.contact.username}
          />

          <div className={styles.username_unread_messages_count_content_container}>
            <div className={styles.username_unread_messages_count_container}>
              <strong>
                {conversation.contact.username}
              </strong>

              {conversation.unreadMessagesCount > 0 && (
                <span>
                  {conversation.unreadMessagesCount}
                </span>
              )}
            </div>

            <p>
              {conversation.lastMessage?.content ?? 'No messages yet'}
            </p>
          </div> 
        </button>
      ))}
    </div>
  );
};