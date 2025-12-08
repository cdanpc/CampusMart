package com.appdevg5.technominds.Message;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Message entity.
 */
@Repository
public interface MessageRepository extends JpaRepository<MessageEntity, Integer> {

    /**
     * Finds all messages sent by a specific sender.
     * Uses nested property path to match MessageEntity.sender.id
     */
    List<MessageEntity> findBySender_Id(Integer senderId);

    /**
     * Finds all messages received by a specific receiver.
     * Uses nested property path to match MessageEntity.receiver.id
     */
    List<MessageEntity> findByReceiver_Id(Integer receiverId);

    /**
     * Finds the conversation history between two specific users in chronological order.
     * Uses nested property path and the createdAt timestamp.
     */
    List<MessageEntity> findBySender_IdAndReceiver_IdOrderByCreatedAtAsc(Integer senderId, Integer receiverId);

    /**
     * Finds messages between two users for a specific product.
     */
    List<MessageEntity> findBySender_IdAndReceiver_IdAndProduct_IdOrderByCreatedAtAsc(
        Integer senderId, Integer receiverId, Integer productId);
    
    /**
     * Finds messages between two users with no product (general inquiries).
     */
    List<MessageEntity> findBySender_IdAndReceiver_IdAndProduct_IsNullOrderByCreatedAtAsc(
        Integer senderId, Integer receiverId);

    /**
     * Count unread messages for a specific user.
     */
    Long countByReceiver_IdAndIsRead(Integer receiverId, Boolean isRead);

    /**
     * Find all messages where user is either sender or receiver, ordered by most recent.
     */
    @Query("SELECT m FROM MessageEntity m WHERE m.sender.id = :userId OR m.receiver.id = :userId ORDER BY m.createdAt DESC")
    List<MessageEntity> findAllUserMessages(@Param("userId") Integer userId);

    /**
     * Find unread messages for a receiver.
     */
    List<MessageEntity> findByReceiver_IdAndIsReadOrderByCreatedAtDesc(Integer receiverId, Boolean isRead);

    /**
     * Find conversation between two users for a specific product, excluding deleted messages.
     */
    @Query("SELECT m FROM MessageEntity m WHERE " +
           "((m.sender.id = :user1Id AND m.receiver.id = :user2Id) OR " +
           " (m.sender.id = :user2Id AND m.receiver.id = :user1Id)) " +
           "AND (:productId IS NULL OR m.product.id = :productId) " +
           "AND m.isDeleted = FALSE " +
           "ORDER BY m.createdAt ASC")
    List<MessageEntity> findConversation(
        @Param("user1Id") Integer user1Id,
        @Param("user2Id") Integer user2Id,
        @Param("productId") Integer productId
    );

    /**
     * Soft delete all messages in a conversation for a specific user.
     */
    @Query("UPDATE MessageEntity m SET m.isDeleted = TRUE WHERE " +
           "((m.sender.id = :userId AND m.receiver.id = :otherUserId) OR " +
           " (m.sender.id = :otherUserId AND m.receiver.id = :userId)) " +
           "AND (:productId IS NULL OR m.product.id = :productId)")
    @Modifying
    void softDeleteConversation(
        @Param("userId") Integer userId,
        @Param("otherUserId") Integer otherUserId,
        @Param("productId") Integer productId
    );

    /**
     * Archive all messages in a conversation.
     */
    @Query("UPDATE MessageEntity m SET m.isArchived = TRUE WHERE " +
           "((m.sender.id = :userId AND m.receiver.id = :otherUserId) OR " +
           " (m.sender.id = :otherUserId AND m.receiver.id = :userId)) " +
           "AND (:productId IS NULL OR m.product.id = :productId)")
    @Modifying
    void archiveConversation(
        @Param("userId") Integer userId,
        @Param("otherUserId") Integer otherUserId,
        @Param("productId") Integer productId
    );

    /**
     * Mute/unmute a conversation.
     */
    @Query("UPDATE MessageEntity m SET m.isMuted = :muted WHERE " +
           "((m.sender.id = :userId AND m.receiver.id = :otherUserId) OR " +
           " (m.sender.id = :otherUserId AND m.receiver.id = :userId)) " +
           "AND (:productId IS NULL OR m.product.id = :productId)")
    @Modifying
    void muteConversation(
        @Param("userId") Integer userId,
        @Param("otherUserId") Integer otherUserId,
        @Param("productId") Integer productId,
        @Param("muted") Boolean muted
    );

    /**
     * Find all conversations for a user, excluding deleted and archived messages.
     */
    @Query("SELECT m FROM MessageEntity m WHERE " +
           "(m.sender.id = :userId OR m.receiver.id = :userId) " +
           "AND m.isDeleted = FALSE " +
           "AND m.isArchived = FALSE " +
           "ORDER BY m.createdAt DESC")
    List<MessageEntity> findActiveUserMessages(@Param("userId") Integer userId);
}