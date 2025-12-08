USE campusmart;

-- Add new columns to messages table
ALTER TABLE messages 
ADD COLUMN image_url VARCHAR(500) AFTER content,
ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE AFTER is_read,
ADD COLUMN is_archived BOOLEAN DEFAULT FALSE AFTER is_deleted,
ADD COLUMN is_muted BOOLEAN DEFAULT FALSE AFTER is_archived;

-- Create conversation_reports table
CREATE TABLE IF NOT EXISTS conversation_reports (
    report_id INT PRIMARY KEY AUTO_INCREMENT,
    reporter_profile_id INT NOT NULL,
    reported_profile_id INT NOT NULL,
    product_id INT,
    reason TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_profile_id) REFERENCES profiles(profile_id),
    FOREIGN KEY (reported_profile_id) REFERENCES profiles(profile_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

SELECT 'Database schema updated successfully!' AS message;
