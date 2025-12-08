package com.appdevg5.technominds.controller;

import com.appdevg5.technominds.entity.NotificationEntity;
import com.appdevg5.technominds.Notification.NotificationDTO;
import com.appdevg5.technominds.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * Get all notifications for a user
     */
    @GetMapping("/profile/{profileId}")
    public ResponseEntity<List<NotificationDTO>> getNotificationsByProfile(
            @PathVariable Integer profileId,
            @RequestParam(required = false) String type) {
        
        List<NotificationDTO> notifications;
        if (type != null && !type.isEmpty()) {
            notifications = notificationService.getNotificationsByType(profileId, type);
        } else {
            notifications = notificationService.getNotificationsByProfile(profileId);
        }
        return ResponseEntity.ok(notifications);
    }
    
    /**
     * Get unread notifications for a user
     */
    @GetMapping("/profile/{profileId}/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(@PathVariable Integer profileId) {
        List<NotificationDTO> notifications = notificationService.getUnreadNotifications(profileId);
        return ResponseEntity.ok(notifications);
    }
    
    /**
     * Get unread notification count
     */
    @GetMapping("/profile/{profileId}/unread/count")
    public ResponseEntity<Integer> getUnreadCount(@PathVariable Integer profileId) {
        Integer count = notificationService.getUnreadCount(profileId);
        return ResponseEntity.ok(count);
    }
    
    /**
     * Mark a notification as read
     */
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<NotificationEntity> markAsRead(@PathVariable Long notificationId) {
        NotificationEntity notification = notificationService.markAsRead(notificationId);
        return ResponseEntity.ok(notification);
    }
    
    /**
     * Mark all notifications as read for a user
     */
    @PatchMapping("/profile/{profileId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Integer profileId) {
        notificationService.markAllAsRead(profileId);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Delete a notification
     */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Delete all notifications for a user
     */
    @DeleteMapping("/profile/{profileId}")
    public ResponseEntity<Void> deleteAllNotifications(@PathVariable Integer profileId) {
        notificationService.deleteAllNotifications(profileId);
        return ResponseEntity.noContent().build();
    }
}
