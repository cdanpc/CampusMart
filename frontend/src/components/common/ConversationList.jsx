import { formatRelativeTime } from '../../utils';
import './ConversationList.css';

/**
 * ConversationList Component
 * Displays list of conversations with search functionality
 * 
 * @param {Array} conversations - Array of conversation objects
 * @param {Object} selectedConversation - Currently selected conversation
 * @param {Function} onSelectConversation - Callback when conversation is selected
 * @param {string} searchQuery - Search query text
 * @param {Function} onSearchChange - Search query change callback
 * @param {boolean} loading - Whether conversations are loading
 */
export default function ConversationList({
  conversations = [],
  selectedConversation,
  onSelectConversation,
  searchQuery = '',
  onSearchChange,
  loading = false
}) {
  const filteredConversations = conversations.filter(conv =>
    `${conv.otherUserFirstName} ${conv.otherUserLastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="conversation-list">
        <div className="conversation-list__loading">
          <p>Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (filteredConversations.length === 0) {
    return (
      <div className="conversation-list">
        <div className="conversation-list__empty">
          <p>{searchQuery ? 'No conversations found' : 'No conversations yet'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="conversation-list">
      {filteredConversations.map((conv) => (
        <div
          key={`${conv.otherUserId}-${conv.product?.productId || 0}`}
          className={`conversation-item ${
            selectedConversation?.otherUserId === conv.otherUserId && 
            selectedConversation?.product?.productId === conv.product?.productId 
              ? 'conversation-item--active' 
              : ''
          }`}
          onClick={() => onSelectConversation(conv)}
        >
          <div className="conversation-item__avatar">
            {conv.otherUserFirstName[0]}{conv.otherUserLastName[0]}
          </div>
          <div className="conversation-item__content">
            <div className="conversation-item__header">
              <h3 className="conversation-item__name">
                {conv.otherUserFirstName} {conv.otherUserLastName}
              </h3>
              <span className="conversation-item__time">
                {formatRelativeTime(conv.lastMessageTime)}
              </span>
            </div>
            <p className="conversation-item__product">
              {conv.product?.name || 'General Inquiry'}
            </p>
            <p className="conversation-item__last-message">
              {conv.lastMessageContent}
            </p>
          </div>
          {conv.unreadCount > 0 && (
            <div className="conversation-item__badge">
              {conv.unreadCount}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}