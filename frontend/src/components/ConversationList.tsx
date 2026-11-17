import type { ConversationListItem } from "@shared/dtos/message.dto";
import styles from './css/ConversationList.module.css';
import animations from '@assets/css/Animations.module.css';
import profileImagePlaceholder from '@assets/img/profile_image_placeholder.png';
import { toFormatTimeByDate } from "@/utils/toFormatTimeByDate.util";
import { LoadingState, NotFoundState } from "./ListStates";
import type { RefObject } from "react";

type Props = {
  conversations : ConversationListItem[];
  isLoadingMoreConversations : boolean;
  isLoading     : boolean;
  onSelect      : (conversation: ConversationListItem) => void;
  onScroll      : () => void;
  ref           : RefObject<HTMLDivElement | null>;
};

export const ConversationList = ({
  conversations,
  isLoadingMoreConversations,
  isLoading,
  onSelect,
  onScroll,
  ref,
}: Props): React.JSX.Element => {

  if (isLoading) {
    return (
      <div style={{ margin: '8px 0px' }}>
        <LoadingState label="conversations"/>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div style={{ margin: '8px 0px' }}>
        <NotFoundState label="conversations"/>
      </div>
    )
  }

  return (
    <div 
    ref={ref}
    onScroll={onScroll}
    className={styles.conversations_list_container}
    >
      {conversations.map((conversation, index) => (
        <button
        key={conversation.id}
        style={{ animationDelay: `${index * 80}ms` }}
        className={`${styles.conversation_card} ${animations.fade_in}`}
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

      {isLoadingMoreConversations && (
        <div style={{ margin: '8px 0px' }}>
          <LoadingState label="conversations"/>
        </div>
      )}
    </div>
  );
};