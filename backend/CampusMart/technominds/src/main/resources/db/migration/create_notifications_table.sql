-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_id BIGINT,
    related_type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profiles(profile_id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_profile_created ON notifications(profile_id, created_at DESC);
CREATE INDEX idx_profile_read ON notifications(profile_id, is_read);
CREATE INDEX idx_profile_type ON notifications(profile_id, type);
