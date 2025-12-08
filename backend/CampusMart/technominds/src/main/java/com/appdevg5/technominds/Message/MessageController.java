package com.appdevg5.technominds.Message;

import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST Controller for managing user messages and conversations.
 * Base URL: /api/messages
 */
@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class MessageController {

    private final MessageService messageService;
    
    // Upload directory for message images
    private static final String UPLOAD_DIR = "uploads/messages/";
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final String[] ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"};

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
        // Create upload directory if it doesn't exist
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                System.out.println("Created upload directory: " + uploadPath.toAbsolutePath());
            }
        } catch (IOException e) {
            System.err.println("Failed to create upload directory: " + e.getMessage());
        }
    }

    // GET /api/messages/conversations/{userId} - Get all conversations for a user
    @GetMapping("/conversations/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getConversations(@PathVariable Integer userId) {
        List<Map<String, Object>> conversations = messageService.getConversationsList(userId);
        return ResponseEntity.ok(conversations);
    }

    // GET /api/messages/unread-count/{userId} - Get unread message count
    @GetMapping("/unread-count/{userId}")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable Integer userId) {
        Long count = messageService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    // GET /api/messages/user/{userId} - Get messages received by a specific user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MessageEntity>> getMessagesForUser(@PathVariable Integer userId) {
        List<MessageEntity> messages = messageService.getMessagesReceivedBy(userId);
        return ResponseEntity.ok(messages);
    }

    // GET /api/messages/conversation/{user1Id}/{user2Id} - Get conversation history
    @GetMapping("/conversation/{user1Id}/{user2Id}")
    public ResponseEntity<List<MessageEntity>> getConversation(@PathVariable Integer user1Id, @PathVariable Integer user2Id) {
        List<MessageEntity> convo = messageService.getConversation(user1Id, user2Id);
        return ResponseEntity.ok(convo);
    }

    // GET /api/messages/conversation/{user1Id}/{user2Id}/product/{productId} - Get conversation for specific product
    @GetMapping("/conversation/{user1Id}/{user2Id}/product/{productId}")
    public ResponseEntity<List<MessageEntity>> getConversationByProduct(
            @PathVariable Integer user1Id, 
            @PathVariable Integer user2Id, 
            @PathVariable Integer productId) {
        List<MessageEntity> convo = messageService.getConversationByProduct(user1Id, user2Id, productId);
        return ResponseEntity.ok(convo);
    }

    // GET /api/messages/conversation/{user1Id}/{user2Id}/general - Get general inquiry conversation (no product)
    @GetMapping("/conversation/{user1Id}/{user2Id}/general")
    public ResponseEntity<List<MessageEntity>> getGeneralConversation(
            @PathVariable Integer user1Id, 
            @PathVariable Integer user2Id) {
        // Pass null as productId to get general inquiry messages
        List<MessageEntity> convo = messageService.getConversationByProduct(user1Id, user2Id, null);
        return ResponseEntity.ok(convo);
    }

    // POST /api/messages - Send a new message
    @PostMapping
    public ResponseEntity<MessageEntity> sendMessage(@Valid @RequestBody MessageEntity message) {
        MessageEntity newMessage = messageService.sendMessage(message);

        // Build Location header: /api/messages/{id}
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(newMessage.getId())
                .toUri();

        return ResponseEntity.created(location).body(newMessage);
    }

    // PATCH /api/messages/{id}/read - Mark a message as read
    @PatchMapping("/{id}/read")
    public ResponseEntity<MessageEntity> markMessageAsRead(@PathVariable Integer id) {
        return messageService.markAsRead(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // PATCH /api/messages/conversation/read - Mark all messages in a conversation as read
    @PatchMapping("/conversation/read")
    public ResponseEntity<Map<String, String>> markConversationAsRead(@RequestBody Map<String, Integer> request) {
        Integer userId = request.get("userId");
        Integer otherUserId = request.get("otherUserId");
        Integer productId = request.get("productId");
        
        messageService.markConversationAsRead(userId, otherUserId, productId);
        return ResponseEntity.ok(Map.of("message", "Conversation marked as read"));
    }

    // DELETE /api/messages/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Integer id) {
        return messageService.getMessageById(id)
                .map(existing -> {
                    messageService.deleteMessage(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // DELETE /api/messages/conversation - Soft delete a conversation
    @DeleteMapping("/conversation")
    public ResponseEntity<Map<String, String>> deleteConversation(
            @RequestParam Integer userId,
            @RequestParam Integer otherUserId,
            @RequestParam(required = false) Integer productId) {
        messageService.deleteConversation(userId, otherUserId, productId);
        return ResponseEntity.ok(Map.of("message", "Conversation deleted"));
    }

    // PATCH /api/messages/conversation/archive - Archive a conversation
    @PatchMapping("/conversation/archive")
    public ResponseEntity<Map<String, String>> archiveConversation(
            @RequestParam Integer userId,
            @RequestParam Integer otherUserId,
            @RequestParam(required = false) Integer productId) {
        messageService.archiveConversation(userId, otherUserId, productId);
        return ResponseEntity.ok(Map.of("message", "Conversation archived"));
    }

    // PATCH /api/messages/conversation/mute - Mute/unmute a conversation
    @PatchMapping("/conversation/mute")
    public ResponseEntity<Map<String, String>> muteConversation(
            @RequestParam Integer userId,
            @RequestParam Integer otherUserId,
            @RequestParam(required = false) Integer productId,
            @RequestParam Boolean muted) {
        messageService.muteConversation(userId, otherUserId, productId, muted);
        String action = muted ? "muted" : "unmuted";
        return ResponseEntity.ok(Map.of("message", "Conversation " + action));
    }

    // POST /api/messages/upload-image - Upload image for message
    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadMessageImage(@RequestParam("image") org.springframework.web.multipart.MultipartFile file) {
        try {
            // Validate file exists
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Please select a file to upload"));
            }
            
            // Validate file size
            if (file.getSize() > MAX_FILE_SIZE) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "File size exceeds maximum limit of 5MB"
                ));
            }
            
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Only image files are allowed"
                ));
            }
            
            // Get original filename and validate extension
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid filename"
                ));
            }
            
            // Validate file extension
            String fileExtension = "";
            int lastDotIndex = originalFilename.lastIndexOf('.');
            if (lastDotIndex > 0) {
                fileExtension = originalFilename.substring(lastDotIndex).toLowerCase();
            }
            
            boolean validExtension = false;
            for (String allowedExt : ALLOWED_EXTENSIONS) {
                if (fileExtension.equals(allowedExt)) {
                    validExtension = true;
                    break;
                }
            }
            
            if (!validExtension) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid file type. Allowed types: jpg, jpeg, png, gif, webp"
                ));
            }
            
            // Generate unique filename: UUID_timestamp.extension
            String uniqueFilename = UUID.randomUUID().toString() + "_" + System.currentTimeMillis() + fileExtension;
            
            // Create upload path
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Save file
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Generate URL for accessing the file
            String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/messages/images/")
                    .path(uniqueFilename)
                    .toUriString();
            
            System.out.println("Image uploaded successfully: " + uniqueFilename);
            System.out.println("File saved to: " + filePath.toAbsolutePath());
            System.out.println("Accessible at: " + fileUrl);
            
            return ResponseEntity.ok(Map.of(
                "imageUrl", fileUrl,
                "filename", uniqueFilename,
                "size", String.valueOf(file.getSize()),
                "message", "Image uploaded successfully"
            ));
            
        } catch (IOException e) {
            System.err.println("Failed to upload image: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Failed to save image: " + e.getMessage()
            ));
        } catch (Exception e) {
            System.err.println("Unexpected error during image upload: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Failed to upload image: " + e.getMessage()
            ));
        }
    }
    
    // GET /api/messages/images/{filename} - Serve uploaded message images
    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<Resource> getMessageImage(@PathVariable String filename) {
        try {
            // Validate filename to prevent directory traversal attacks
            if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
                return ResponseEntity.badRequest().build();
            }
            
            // Load file as Resource
            Path filePath = Paths.get(UPLOAD_DIR).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }
            
            // Determine content type
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
                    
        } catch (MalformedURLException e) {
            System.err.println("Invalid file path: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            System.err.println("Error reading file: " + e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Unexpected error serving image: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}
