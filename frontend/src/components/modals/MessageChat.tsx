import styles from '../css/MessageChat.module.css';
import type { InitialChatContact } from "@shared/dtos/message.dto";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { ConversationList } from "../ConversationList";
import { ConversationView } from "../ConversationView";
import SearchBar from "../SearchBar";
import Select from "../Select";
import type { ConversationsAdvancedFilter, ConversationsAdvancedFilterKeys } from "@shared/maps/filters/conversations/conversation.filter";
import { useMessageChat } from "@/hooks/modals/useMessageChat.hook";

export type Props = {
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

  const { states, setters, handlers, refs } = useMessageChat(initialContact);

  return (
    <div className={styles.container}>
      <div className={styles.title_close_minimize_chat_container}>
        <h3>
          {states.selectedChat
            ? states.selectedChat.type === 'EXISTING'
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
      
      {(!isMinimized && !states.selectedChat) &&
        <div className={styles.search_conversation_filter_container}>
          <SearchBar
            value={states.search}
            onSearch={setters.setSearch}
            placeholder="Search conversation..."
          />

          {states.conversations.length > 4 && (
            <Select
              selectConfig="CONVERSATIONS_ADVANCED_FILTER"
              value={states.advancedFilter}
              onSelect={(value) => setters.setAdvancedFilter(
                value as ConversationsAdvancedFilter === '_'
                ? 'MOST_RECENTS_MESSAGES'
                : value as ConversationsAdvancedFilterKeys
              )}
              padding={{
                Y: "3px",
              }}
            />
          )}
        </div>
      }

      <div 
      className={`
        ${styles.content_panel}
        ${isMinimized ? styles.minimized : ''}
      `}>
        <div className={styles.content_inner}>
          {states.selectedChat ? (
            <ConversationView
              key={states.selectedChat.type === 'EXISTING'
                ? `conversation-${states.selectedChat.conversation.id}`
                : `new-${states.selectedChat.contact.id}`
              }
              selectedChat={states.selectedChat}
              onBack={handlers.handleBack}
              onConversationCreated={(conversation, message) => {
                setters.setConversations(previous => {
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

                setters.setSelectedChat({
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
              onScroll={handlers.handleConversationScroll}
              isLoadingMoreConversations={states.isLoadingMore}
              ref={refs.contentPanelRef}
              conversations={states.conversations}
              isLoading={states.isLoading}
              onSelect={conversation =>
                setters.setSelectedChat({
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