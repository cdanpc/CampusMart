package com.appdevg5.technominds.service;

import com.appdevg5.technominds.entity.NotificationEntity;
import com.appdevg5.technominds.Notification.NotificationDTO;
import com.appdevg5.technominds.Profile.ProfileEntity;
import com.appdevg5.technominds.repository.NotificationRepository;
import com.appdevg5.technominds.Profile.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private ProfileRepository profileRepository;
    
    /**
     * Create a notification for a user
     */
    public NotificationEntity createNotification(Integer profileId, String type, String title, String message, Long relatedId, String relatedType) {
        ProfileEntity profile = profileRepository.findById(profileId)
            .orElseThrow(() -> new IllegalArgumentException("Profile not found with id: " + profileId));
        
        NotificationEntity notification = new NotificationEntity(profile, type, title, message, relatedId, relatedType);
        return notificationRepository.save(notification);
    }
    
    /**
     * Get all notifications for a user
     */
    public List<NotificationDTO> getNotificationsByProfile(Integer profileId) {
        List<NotificationEntity> notifications = notificationRepository.findByProfileIdOrderByCreatedAtDesc(profileId);
        return notifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get notifications by type for a user
     */
    public List<NotificationDTO> getNotificationsByType(Integer profileId, String type) {
        List<NotificationEntity> notifications = notificationRepository.findByProfileIdAndTypeOrderByCreatedAtDesc(profileId, type);
        return notifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get unread notifications for a user
     */
    public List<NotificationDTO> getUnreadNotifications(Integer profileId) {
        List<NotificationEntity> notifications = notificationRepository.findByProfileIdAndIsReadOrderByCreatedAtDesc(profileId, false);
        return notifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get unread notification count for a user
     */
    public Integer getUnreadCount(Integer profileId) {
        return notificationRepository.countByProfileIdAndIsRead(profileId, false);
    }
    
    /**
     * Mark a notification as read
     */
    public NotificationEntity markAsRead(Long notificationId) {
        NotificationEntity notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new IllegalArgumentException("Notification not found with id: " + notificationId));
        
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }
    
    /**
     * Mark all notifications as read for a user
     */
    public void markAllAsRead(Integer profileId) {
        List<NotificationEntity> notifications = notificationRepository.findByProfileIdAndIsReadOrderByCreatedAtDesc(profileId, false);
        notifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(notifications);
    }
    
    /**
     * Delete a notification
     */
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }
    
    /**
     * Delete all notifications for a user
     */
    @Transactional
    public void deleteAllNotifications(Integer profileId) {
        notificationRepository.deleteAllByProfileId(profileId);
    }
    
    /**
     * Convert NotificationEntity to NotificationDTO
     */
    private NotificationDTO convertToDTO(NotificationEntity entity) {
        String profileName = entity.getProfile().getFirstName() + " " + entity.getProfile().getLastName();
        Long profileId = entity.getProfile().getId().longValue();
        
        return new NotificationDTO(
            entity.getId(),
            profileId,
            profileName,
            entity.getType(),
            entity.getTitle(),
            entity.getMessage(),
            entity.getRelatedId(),
            entity.getRelatedType(),
            entity.getIsRead(),
            entity.getCreatedAt()
        );
    }
    
    // Helper methods for creating specific notification types
    
    public NotificationEntity notifyOrderPlaced(Integer sellerId, Long orderId, String productName, String buyerName) {
        String title = "New Order Received!";
        String message = String.format("%s placed an order for your product '%s'", buyerName, productName);
        return createNotification(sellerId, "ORDER_PLACED", title, message, orderId, "ORDER");
    }
    
    public NotificationEntity notifyOrderConfirmed(Integer buyerId, Long orderId, String productName) {
        String title = "Order Confirmed!";
        String message = String.format("Your order for '%s' has been confirmed by the seller. Awaiting pickup preparation.", productName);
        return createNotification(buyerId, "ORDER_CONFIRMED", title, message, orderId, "ORDER");
    }
    
    public NotificationEntity notifyOrderReadyForPickup(Integer buyerId, Long orderId, String productName, String pickupLocation) {
        String title = "Order Ready for Pickup!";
        String message = String.format("Your order for '%s' is ready for pickup at %s", productName, pickupLocation);
        return createNotification(buyerId, "ORDER_READY", title, message, orderId, "ORDER");
    }
    
    public NotificationEntity notifyOrderCompleted(Integer buyerId, Long orderId, String productName) {
        String title = "Order Completed!";
        String message = String.format("Your order for '%s' has been completed. Thank you for your purchase!", productName);
        return createNotification(buyerId, "ORDER_COMPLETED", title, message, orderId, "ORDER");
    }
    
    public NotificationEntity notifyOrderCancelled(Integer profileId, Long orderId, String productName, String reason) {
        String title = "Order Cancelled";
        String message = String.format("Order for '%s' has been cancelled. Reason: %s", productName, reason);
        return createNotification(profileId, "ORDER_CANCELLED", title, message, orderId, "ORDER");
    }
}
