import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiSearch, FiSend, FiMoreVertical, FiImage, FiEye, FiUser, FiAlertCircle, FiTrash2, FiArchive, FiBellOff, FiX } from 'react-icons/fi';
import { 
  getConversations, 
  getConversationByProduct, 
  sendMessage, 
  markConversationAsRead,
  deleteConversation,
  archiveConversation,
  muteConversation,
  reportConversation,
  uploadMessageImage
} from '../../services/messageService';
import { formatRelativeTime } from '../../utils';
import ConversationList from '../../components/common/ConversationList';
import ImageUploadModal from '../../components/common/ImageUploadModal';
import './MessagesPage.css';

export default function MessagesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const menuRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Get current user from localStorage (set during login)
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  
  // Debug: Log user structure to identify the issue
  // console.log('[MessagesPage] Raw localStorage user:', localStorage.getItem('user'));
  // console.log('[MessagesPage] Parsed currentUser:', currentUser);
  // console.log('[MessagesPage] currentUser?.profile:', currentUser?.profile);
  // console.log('[MessagesPage] currentUser?.profile?.id:', currentUser?.profile?.id);
  
  const currentUserId = currentUser?.profile?.id || null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = useCallback(async () => {
    if (!currentUserId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getConversations(currentUserId);
      console.log('Fetched conversations:', data);
      setConversations(data);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  const fetchMessages = useCallback(async (conversation) => {
    if (!currentUserId) return;
    
    try {
      const data = await getConversationByProduct(
        currentUserId,
        conversation.otherUserId,
        conversation.product?.productId || null
      );
      console.log('Fetched messages:', data);
      setMessages(data);
      
      // Mark as read
      await markConversationAsRead({
        userId: currentUserId,
        otherUserId: conversation.otherUserId,
        productId: conversation.product?.productId || null
      });
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  }, [currentUserId]);

  const handleSelectConversation = useCallback((conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation);
  }, [fetchMessages]);

  // Fetch conversations on mount
  useEffect(() => {
    if (currentUserId) {
      fetchConversations();
    } else {
      setError('Please log in to view messages');
      setLoading(false);
    }
  }, [currentUserId, fetchConversations]);

  // Auto-select conversation based on query parameter
  useEffect(() => {
    const userParam = searchParams.get('user');
    const productParam = searchParams.get('product');
    
    if (userParam && conversations.length > 0) {
      const conversation = conversations.find(
        conv => conv.otherUserId === parseInt(userParam) && 
               (!productParam || conv.product?.productId === parseInt(productParam))
      );
      if (conversation) {
        handleSelectConversation(conversation);
      }
    }
  }, [searchParams, conversations, handleSelectConversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages every 5 seconds when conversation is open
  useEffect(() => {
    if (!selectedConversation || !currentUserId) return;

    const interval = setInterval(() => {
      fetchMessages(selectedConversation);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedConversation, currentUserId, fetchMessages]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuAction = async (action) => {
    if (!selectedConversation) return;

    switch (action) {
      case 'view-product':
        if (selectedConversation.product) {
          navigate(`/product/${selectedConversation.product.productId}`);
        }
        break;
      case 'view-profile':
        navigate(`/seller/${selectedConversation.otherUserId}`);
        break;
      case 'report':
        setShowReportModal(true);
        break;
      case 'delete':
        if (confirm(`Delete conversation with ${selectedConversation.otherUserFirstName} ${selectedConversation.otherUserLastName}?`)) {
          try {
            await deleteConversation(
              currentUserId,
              selectedConversation.otherUserId,
              selectedConversation.product?.productId
            );
            // Refresh conversations and clear selection
            await loadConversations();
            setSelectedConversation(null);
            setMessages([]);
          } catch (err) {
            console.error('Error deleting conversation:', err);
            setError('Failed to delete conversation');
          }
        }
        break;
      case 'archive':
        try {
          await archiveConversation(
            currentUserId,
            selectedConversation.otherUserId,
            selectedConversation.product?.productId
          );
          // Refresh conversations and clear selection
          await loadConversations();
          setSelectedConversation(null);
          setMessages([]);
        } catch (err) {
          console.error('Error archiving conversation:', err);
          setError('Failed to archive conversation');
        }
        break;
      case 'mute':
        try {
          // Toggle mute status (assuming false for now, could track mute state)
          await muteConversation(
            currentUserId,
            selectedConversation.otherUserId,
            true,
            selectedConversation.product?.productId
          );
          alert('Notifications muted for this conversation');
        } catch (err) {
          console.error('Error muting conversation:', err);
          setError('Failed to mute conversation');
        }
        break;
      default:
        break;
    }
    setIsMenuOpen(false);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    // Validate file sizes (500MB max)
    const maxSize = 500 * 1024 * 1024; // 500MB in bytes
    const oversizedFiles = imageFiles.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      alert(`Some files exceed 500MB limit and were not added.`);
    }
    
    const validFiles = imageFiles.filter(file => file.size <= maxSize);
    
    if (validFiles.length > 0) {
      const newImages = [];
      let loadedCount = 0;
      
      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push({
            file,
            preview: reader.result,
            id: Date.now() + Math.random()
          });
          loadedCount++;
          
          if (loadedCount === validFiles.length) {
            setSelectedImages(prev => [...prev, ...newImages]);
            setShowImageModal(true);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveSelectedImage = (imageId) => {
    setSelectedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleAddMoreImages = () => {
    fileInputRef.current?.click();
  };

  const handleCancelImageModal = () => {
    setSelectedImages([]);
    setShowImageModal(false);
  };

  const handleImageClick = (imageUrl) => {
    setPreviewImage(imageUrl);
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  const handleSendImages = async () => {
    if (selectedImages.length === 0 || !selectedConversation || !currentUserId) {
      return;
    }

    setError(null);
    setUploadingImages(true);
    const messageText = messageInput.trim() || '(Image)';

    try {
      let successCount = 0;
      // Send each image as a separate message
      for (let i = 0; i < selectedImages.length; i++) {
        const image = selectedImages[i];
        
        try {
          console.log(`Uploading image ${i + 1} of ${selectedImages.length}...`);
          const uploadResult = await uploadMessageImage(image.file);
          console.log('Upload result:', uploadResult);
          
          if (!uploadResult.imageUrl) {
            throw new Error('No image URL returned from server');
          }
          
          const messageData = {
            senderId: currentUserId,
            receiverId: selectedConversation.otherUserId,
            productId: selectedConversation.product?.productId || null,
            content: i === 0 ? messageText : '(Image)',
            imageUrl: uploadResult.imageUrl
          };

          console.log('Sending message with image:', messageData);
          await sendMessage(messageData);
          successCount++;
        } catch (imgError) {
          console.error(`Error uploading image ${i + 1}:`, imgError);
          setError(`Failed to upload image ${i + 1}: ${imgError.response?.data?.error || imgError.message || 'Unknown error'}`);
        }
      }

      if (successCount > 0) {
        // Clear states only if at least one image was sent successfully
        setMessageInput('');
        setSelectedImages([]);
        setShowImageModal(false);
        
        // Refresh messages
        await fetchMessages(selectedConversation);
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      console.error('Error in handleSendImages:', err);
      setError(`Failed to send images: ${err.message || 'Unknown error'}`);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleReportSubmit = async () => {
    if (!reportReason.trim()) {
      alert('Please provide a reason for reporting');
      return;
    }

    try {
      await reportConversation({
        reporterId: currentUserId,
        reportedUserId: selectedConversation.otherUserId,
        productId: selectedConversation.product?.productId || null,
        reason: reportReason.trim()
      });
      alert('Conversation reported successfully');
      setShowReportModal(false);
      setReportReason('');
    } catch (err) {
      console.error('Error reporting conversation:', err);
      setError('Failed to report conversation');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    // If images are selected, send them via the modal
    if (selectedImages.length > 0) {
      await handleSendImages();
      return;
    }
    
    if (!messageInput.trim() || !selectedConversation || !currentUserId) {
      return;
    }

    try {
      const messageData = {
        senderId: currentUserId,
        receiverId: selectedConversation.otherUserId,
        productId: selectedConversation.product?.productId || null,
        content: messageInput.trim(),
        imageUrl: null
      };

      console.log('Sending message with data:', messageData);
      await sendMessage(messageData);
      setMessageInput('');
      
      // Refresh only the current conversation messages
      await fetchMessages(selectedConversation);
      
      // Scroll to bottom after sending
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const fullName = `${conv.otherUserFirstName} ${conv.otherUserLastName}`.toLowerCase();
    const productName = conv.product?.name?.toLowerCase() || 'general inquiry';
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || productName.includes(query);
  });

  return (
    <div className="messages-page">
      <div className="messages-container">
        
        {/* Conversations List */}
        <div className="conversations-panel">
          <div className="conversations-header">
            <h1 className="conversations-title">Messages</h1>
            <div className="conversations-search">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="conversations-list">
            {loading ? (
              <div className="empty-state">
                <p>Loading conversations...</p>
              </div>
            ) : error ? (
              <div className="empty-state">
                <p>Error: {error}</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="empty-state">
                <p>No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={`${conv.otherUserId}-${conv.product?.productId || 0}`}
                  className={`conversation-item ${selectedConversation?.otherUserId === conv.otherUserId && selectedConversation?.product?.productId === conv.product?.productId ? 'conversation-item--active' : ''}`}
                  onClick={() => handleSelectConversation(conv)}
                >
                  <div className="conversation-avatar">
                    {conv.otherUserFirstName[0]}{conv.otherUserLastName[0]}
                  </div>
                  <div className="conversation-content">
                    <div className="conversation-header">
                      <h3 className="conversation-name">
                        {conv.otherUserFirstName} {conv.otherUserLastName}
                      </h3>
                      <span className="conversation-time">
                        {formatRelativeTime(conv.lastMessageTime)}
                      </span>
                    </div>
                    <p className="conversation-product">
                      {conv.product?.name || 'General Inquiry'}
                    </p>
                    <p className="conversation-last-message">
                      {conv.lastMessageContent}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="conversation-badge">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="chat-panel">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-header-info">
                  <div className="chat-avatar">
                    {selectedConversation.otherUserFirstName[0]}{selectedConversation.otherUserLastName[0]}
                  </div>
                  <div className="chat-header-text">
                    <h2 className="chat-header-name">
                      {selectedConversation.otherUserFirstName} {selectedConversation.otherUserLastName}
                    </h2>
                    <p className="chat-header-product">
                      {selectedConversation.product ? (
                        <>{selectedConversation.product.name} • ₱{selectedConversation.product.price.toLocaleString('en-PH')}</>
                      ) : (
                        'General Inquiry'
                      )}
                    </p>
                  </div>
                </div>
                <div className="chat-header-menu-wrapper" ref={menuRef}>
                  <button 
                    className="chat-header-menu"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                    <FiMoreVertical />
                  </button>
                  
                  {isMenuOpen && (
                    <div className="chat-menu-dropdown">
                      {selectedConversation.product && (
                        <button 
                          className="chat-menu-item"
                          onClick={() => handleMenuAction('view-product')}
                        >
                          <FiEye className="chat-menu-icon" />
                          View Product
                        </button>
                      )}
                      <button 
                        className="chat-menu-item"
                        onClick={() => handleMenuAction('view-profile')}
                      >
                        <FiUser className="chat-menu-icon" />
                        View Profile
                      </button>
                      <div className="chat-menu-divider"></div>
                      <button 
                        className="chat-menu-item"
                        onClick={() => handleMenuAction('mute')}
                      >
                        <FiBellOff className="chat-menu-icon" />
                        Mute Notifications
                      </button>
                      <button 
                        className="chat-menu-item"
                        onClick={() => handleMenuAction('archive')}
                      >
                        <FiArchive className="chat-menu-icon" />
                        Archive Conversation
                      </button>
                      <div className="chat-menu-divider"></div>
                      <button 
                        className="chat-menu-item chat-menu-item--warning"
                        onClick={() => handleMenuAction('report')}
                      >
                        <FiAlertCircle className="chat-menu-icon" />
                        Report
                      </button>
                      <button 
                        className="chat-menu-item chat-menu-item--danger"
                        onClick={() => handleMenuAction('delete')}
                      >
                        <FiTrash2 className="chat-menu-icon" />
                        Delete Conversation
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages Area */}
              <div className="messages-area">
                {loading ? (
                  <div className="messages-loading">Loading messages...</div>
                ) : error ? (
                  <div className="messages-error">{error}</div>
                ) : messages.length === 0 ? (
                  <div className="messages-empty">No messages yet. Start the conversation!</div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.messageId}
                      className={`message ${msg.sender.id === currentUserId ? 'message--sent' : 'message--received'}`}
                    >
                      <div className="message-bubble">
                        {msg.imageUrl && (
                          <img 
                            src={msg.imageUrl}
                            alt="Message attachment"
                            className="message-image"
                            onClick={() => {
                              console.log('Image clicked:', msg.imageUrl);
                              handleImageClick(msg.imageUrl);
                            }}
                            onLoad={(e) => {
                              console.log('Image loaded successfully:', msg.imageUrl);
                            }}
                            onError={(e) => {
                              console.error('Image failed to load:', msg.imageUrl);
                              // If it's a placeholder URL, replace with a better placeholder image
                              if (msg.imageUrl.includes('via.placeholder.com')) {
                                e.target.src = 'https://placehold.co/400x300/052659/ffffff?text=Uploaded+Image&font=roboto';
                              } else {
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EImage not available%3C/text%3E%3C/svg%3E';
                              }
                              e.target.style.cursor = 'default';
                            }}
                          />
                        )}
                        <p className="message-content">{msg.content}</p>
                        <span className="message-time">
                          {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form className="message-input-form" onSubmit={handleSendMessage}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                />
                <button 
                  type="button" 
                  className="attachment-btn" 
                  title="Send image"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FiImage />
                </button>
                
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="message-input"
                />
                <button type="submit" className="send-btn" disabled={!messageInput.trim()}>
                  <FiSend />
                </button>
              </form>
            </>
          ) : (
            <div className="empty-chat">
              <div className="empty-chat-content">
                <FiSearch className="empty-chat-icon" />
                <h2>Select a conversation</h2>
                <p>Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Image Preview Modal */}
      {showImageModal && (
        <div className="modal-overlay" onClick={handleCancelImageModal}>
          <div className="image-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="image-modal-header">
              <h3>Send Image{selectedImages.length > 1 ? 's' : ''}</h3>
              <button 
                className="modal-close-btn"
                onClick={handleCancelImageModal}
              >
                <FiX />
              </button>
            </div>
            
            <div className="image-modal-body">
              <div className="image-grid">
                {selectedImages.map((image) => (
                  <div key={image.id} className="image-grid-item">
                    <img src={image.preview} alt="Preview" />
                    <button
                      type="button"
                      className="image-delete-btn"
                      onClick={() => handleRemoveSelectedImage(image.id)}
                      title="Remove image"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="image-modal-message">
                <input
                  type="text"
                  placeholder="Add a message (optional)..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="image-message-input"
                />
              </div>
            </div>
            
            <div className="image-modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleAddMoreImages}
              >
                <FiImage /> Add More
              </button>
              <div className="image-modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCancelImageModal}
                  disabled={uploadingImages}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSendImages}
                  disabled={selectedImages.length === 0 || uploadingImages}
                >
                  {uploadingImages ? (
                    <>
                      <span className="spinner"></span> Uploading...
                    </>
                  ) : (
                    <>
                      <FiSend /> Send ({selectedImages.length})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="report-modal-header">
              <h3>Report Conversation</h3>
              <button 
                className="modal-close-btn"
                onClick={() => setShowReportModal(false)}
              >
                <FiX />
              </button>
            </div>
            <div className="report-modal-body">
              <p>Report conversation with {selectedConversation?.otherUserFirstName} {selectedConversation?.otherUserLastName}</p>
              <textarea
                placeholder="Please provide a reason for reporting this conversation..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="report-textarea"
                rows="5"
              />
            </div>
            <div className="report-modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowReportModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-danger"
                onClick={handleReportSubmit}
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Image Preview Modal */}
      {previewImage && (
        <div className="modal-overlay" onClick={handleClosePreview}>
          <div className="image-fullscreen-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-btn modal-close-btn--absolute"
              onClick={handleClosePreview}
            >
              <FiX />
            </button>
            <img src={previewImage} alt="Full size preview" className="fullscreen-image" />
          </div>
        </div>
      )}
    </div>
  );
}
