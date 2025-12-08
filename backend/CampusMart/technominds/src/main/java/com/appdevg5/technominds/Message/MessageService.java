package com.appdevg5.technominds.Message;

import com.appdevg5.technominds.Profile.ProfileEntity;
import com.appdevg5.technominds.Profile.ProfileRepository;
import com.appdevg5.technominds.Product.ProductEntity;
import com.appdevg5.technominds.Product.ProductRepository;
import com.appdevg5.technominds.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Service layer for managing Message-related business logic (sending, retrieving conversations).
 * Assumes MessageRepository is also in this package and uses nested property path method names
 * (e.g. findByReceiver_Id, findBySender_IdAndReceiver_IdOrderByCreatedAtAsc).
 */
@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final ProfileRepository profileRepository;
    private final ProductRepository productRepository;
    private final NotificationService notificationService;

    public MessageService(MessageRepository messageRepository, 
                         ProfileRepository profileRepository,
                         ProductRepository productRepository,
                         NotificationService notificationService) {
        this.messageRepository = messageRepository;
        this.profileRepository = profileRepository;
        this.productRepository = productRepository;
        this.notificationService = notificationService;
    }

    // READ
    @Transactional(readOnly = true)
    public Optional<MessageEntity> getMessageById(Integer id) {
        Optional<MessageEntity> message = messageRepository.findById(id);
        // Force lazy loading
        message.ifPresent(m -> {
            m.getSender().getId();
            m.getReceiver().getId();
            if (m.getProduct() != null) {
                m.getProduct().getId();
            }
        });
        return message;
    }

    /**
     * Finds messages where the given profile is the receiver.
     * Repository method expected: List<MessageEntity> findByReceiver_Id(Integer receiverId);
     */
    @Transactional(readOnly = true)
    public List<MessageEntity> getMessagesReceivedBy(Integer receiverId) {
        List<MessageEntity> messages = messageRepository.findByReceiver_Id(receiverId);
        // Force lazy loading
        messages.forEach(m -> {
            m.getSender().getId();
            if (m.getProduct() != null) {
                m.getProduct().getId();
            }
        });
        return messages;
    }

    /**
     * Retrieves the chronological conversation between two users.
     *
     * Repository methods expected:
     * List<MessageEntity> findBySender_IdAndReceiver_IdOrderByCreatedAtAsc(Integer senderId, Integer receiverId);
     */
    @Transactional(readOnly = true)
    public List<MessageEntity> getConversation(Integer user1Id, Integer user2Id) {
        // Messages user1 -> user2
        List<MessageEntity> sent = messageRepository.findBySender_IdAndReceiver_IdOrderByCreatedAtAsc(user1Id, user2Id);
        // Messages user2 -> user1
        List<MessageEntity> received = messageRepository.findBySender_IdAndReceiver_IdOrderByCreatedAtAsc(user2Id, user1Id);

        // Combine lists into a new list and sort by createdAt to ensure correct chronological order
        List<MessageEntity> conversation = new ArrayList<>(sent.size() + received.size());
        conversation.addAll(sent);
        conversation.addAll(received);

        // Force lazy loading
        conversation.forEach(m -> {
            m.getSender().getId();
            m.getReceiver().getId();
            if (m.getProduct() != null) {
                m.getProduct().getId();
            }
        });

        // Sort by createdAt (createdAt corresponds to the messages.created_at column)
        conversation.sort(Comparator.comparing(MessageEntity::getCreatedAt, Comparator.nullsFirst(Comparator.naturalOrder())));
        return conversation;
    }

    /**
     * Get conversation between two users for a specific product.
     * If productId is null or 0, retrieves general inquiry messages (no product association).
     */
    @Transactional(readOnly = true)
    public List<MessageEntity> getConversationByProduct(Integer user1Id, Integer user2Id, Integer productId) {
        List<MessageEntity> sent;
        List<MessageEntity> received;
        
        // For general inquiries (productId is null or 0), get messages with no product
        if (productId == null || productId == 0) {
            sent = messageRepository.findBySender_IdAndReceiver_IdAndProduct_IsNullOrderByCreatedAtAsc(
                user1Id, user2Id);
            received = messageRepository.findBySender_IdAndReceiver_IdAndProduct_IsNullOrderByCreatedAtAsc(
                user2Id, user1Id);
        } else {
            // For product-specific messages
            sent = messageRepository.findBySender_IdAndReceiver_IdAndProduct_IdOrderByCreatedAtAsc(
                user1Id, user2Id, productId);
            received = messageRepository.findBySender_IdAndReceiver_IdAndProduct_IdOrderByCreatedAtAsc(
                user2Id, user1Id, productId);
        }

        List<MessageEntity> conversation = new ArrayList<>(sent.size() + received.size());
        conversation.addAll(sent);
        conversation.addAll(received);

        // Force lazy loading
        conversation.forEach(m -> {
            m.getSender().getId();
            m.getReceiver().getId();
            if (m.getProduct() != null) {
                m.getProduct().getId();
            }
        });

        conversation.sort(Comparator.comparing(MessageEntity::getCreatedAt, Comparator.nullsFirst(Comparator.naturalOrder())));
        return conversation;
    }

    /**
     * Get all unique conversations for a user.
     * Groups messages by conversation partner and product.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getConversationsList(Integer userId) {
        List<MessageEntity> allMessages = messageRepository.findAllUserMessages(userId);
        
        // Force lazy loading
        allMessages.forEach(m -> {
            m.getSender().getId();
            m.getReceiver().getId();
            if (m.getProduct() != null) {
                m.getProduct().getId();
            }
        });

        // Group by conversation key (other user + product)
        Map<String, List<MessageEntity>> grouped = new HashMap<>();
        
        for (MessageEntity msg : allMessages) {
            Integer otherUserId = msg.getSender().getId().equals(userId) 
                ? msg.getReceiver().getId() 
                : msg.getSender().getId();
            Integer productId = msg.getProduct() != null ? msg.getProduct().getId() : 0;
            String key = otherUserId + "_" + productId;
            
            grouped.computeIfAbsent(key, k -> new ArrayList<>()).add(msg);
        }

        // Build conversation summaries
        List<Map<String, Object>> conversations = new ArrayList<>();
        
        for (Map.Entry<String, List<MessageEntity>> entry : grouped.entrySet()) {
            List<MessageEntity> messages = entry.getValue();
            messages.sort(Comparator.comparing(MessageEntity::getCreatedAt).reversed());
            
            MessageEntity lastMessage = messages.get(0);
            ProfileEntity otherUser = lastMessage.getSender().getId().equals(userId)
                ? lastMessage.getReceiver()
                : lastMessage.getSender();
            
            // Count unread messages in this conversation
            long unreadCount = messages.stream()
                .filter(m -> m.getReceiver().getId().equals(userId) && !m.getIsRead())
                .count();

            Map<String, Object> conversation = new HashMap<>();
            conversation.put("otherUserId", otherUser.getId());
            conversation.put("otherUserFirstName", otherUser.getFirstName());
            conversation.put("otherUserLastName", otherUser.getLastName());
            conversation.put("otherUserEmail", otherUser.getEmail());
            
            if (lastMessage.getProduct() != null) {
                ProductEntity product = lastMessage.getProduct();
                Map<String, Object> productInfo = new HashMap<>();
                productInfo.put("productId", product.getId());
                productInfo.put("name", product.getName());
                productInfo.put("price", product.getPrice());
                conversation.put("product", productInfo);
            }
            
            conversation.put("lastMessageContent", lastMessage.getContent());
            conversation.put("lastMessageTime", lastMessage.getCreatedAt());
            conversation.put("unreadCount", unreadCount);
            
            conversations.add(conversation);
        }
        
        // Sort by most recent message
        conversations.sort((a, b) -> {
            java.time.LocalDateTime timeA = (java.time.LocalDateTime) a.get("lastMessageTime");
            java.time.LocalDateTime timeB = (java.time.LocalDateTime) b.get("lastMessageTime");
            return timeB.compareTo(timeA);
        });
        
        return conversations;
    }

    /**
     * Get count of unread messages for a user.
     */
    @Transactional(readOnly = true)
    public Long getUnreadCount(Integer userId) {
        return messageRepository.countByReceiver_IdAndIsRead(userId, false);
    }

    /**
     * Mark all messages in a conversation as read.
     * Handles both product-specific messages and general inquiries (where product is null).
     */
    @Transactional
    public void markConversationAsRead(Integer userId, Integer otherUserId, Integer productId) {
        List<MessageEntity> messages;
        if (productId == null || productId == 0) {
            // General inquiry messages (product_id IS NULL)
            messages = messageRepository.findBySender_IdAndReceiver_IdAndProduct_IsNullOrderByCreatedAtAsc(
                otherUserId, userId);
        } else {
            // Product-specific messages
            messages = messageRepository.findBySender_IdAndReceiver_IdAndProduct_IdOrderByCreatedAtAsc(
                otherUserId, userId, productId);
        }
        
        for (MessageEntity message : messages) {
            if (!message.getIsRead()) {
                message.setIsRead(true);
                messageRepository.save(message);
            }
        }
    }

    // CREATE
    @Transactional
    public MessageEntity sendMessage(MessageEntity message) {
        // Validate input
        if (message.getSender() == null || message.getSender().getId() == null) {
            throw new IllegalArgumentException("Sender information is required");
        }
        if (message.getReceiver() == null || message.getReceiver().getId() == null) {
            throw new IllegalArgumentException("Receiver information is required");
        }
        
        // Fetch and set the sender entity
        ProfileEntity sender = profileRepository.findById(message.getSender().getId())
                .orElseThrow(() -> new IllegalArgumentException("Sender profile not found with ID: " + message.getSender().getId()));
        message.setSender(sender);

        // Fetch and set the receiver entity
        ProfileEntity receiver = profileRepository.findById(message.getReceiver().getId())
                .orElseThrow(() -> new IllegalArgumentException("Receiver profile not found with ID: " + message.getReceiver().getId()));
        message.setReceiver(receiver);

        // Fetch and set the product entity if provided
        if (message.getProduct() != null && message.getProduct().getId() != null) {
            ProductEntity product = productRepository.findById(message.getProduct().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + message.getProduct().getId()));
            message.setProduct(product);
        }

        // Ensure isRead is false on creation
        message.setIsRead(false);
        MessageEntity savedMessage = messageRepository.save(message);
        
        // Create notification for receiver
        try {
            String senderName = sender.getFirstName() + " " + sender.getLastName();
            String messagePreview = message.getContent() != null && message.getContent().length() > 50
                ? message.getContent().substring(0, 47) + "..."
                : message.getContent();
            
            notificationService.notifyNewMessage(
                receiver.getId(),
                savedMessage.getId().longValue(),
                senderName,
                messagePreview
            );
        } catch (Exception e) {
            // Log error but don't fail the message send
            System.err.println("Failed to create notification for message: " + e.getMessage());
        }
        
        return savedMessage;
    }

    // UPDATE (Mark as read)
    @Transactional
    public Optional<MessageEntity> markAsRead(Integer messageId) {
        return messageRepository.findById(messageId).map(message -> {
            message.setIsRead(true);
            return messageRepository.save(message);
        });
    }

    // DELETE
    @Transactional
    public void deleteMessage(Integer id) {
        messageRepository.deleteById(id);
    }

    /**
     * Soft delete a conversation between two users for a specific product.
     */
    @Transactional
    public void deleteConversation(Integer userId, Integer otherUserId, Integer productId) {
        messageRepository.softDeleteConversation(userId, otherUserId, productId);
    }

    /**
     * Archive a conversation between two users for a specific product.
     */
    @Transactional
    public void archiveConversation(Integer userId, Integer otherUserId, Integer productId) {
        messageRepository.archiveConversation(userId, otherUserId, productId);
    }

    /**
     * Mute or unmute a conversation between two users for a specific product.
     */
    @Transactional
    public void muteConversation(Integer userId, Integer otherUserId, Integer productId, Boolean muted) {
        messageRepository.muteConversation(userId, otherUserId, productId, muted);
    }

    /**
     * Get active conversations for a user (excluding deleted and archived).
     */
    @Transactional(readOnly = true)
    public List<MessageEntity> getActiveConversations(Integer userId) {
        List<MessageEntity> messages = messageRepository.findActiveUserMessages(userId);
        // Force lazy loading
        messages.forEach(m -> {
            m.getSender().getId();
            m.getReceiver().getId();
            if (m.getProduct() != null) {
                m.getProduct().getId();
            }
        });
        return messages;
    }
}
