-- Insert default categories
INSERT INTO categories (id, name, description) VALUES 
(1, 'Electronics', 'Electronic devices and gadgets'),
(2, 'Books', 'Books and educational materials'),
(3, 'Fashion', 'Clothing, shoes, and accessories'),
(4, 'Home', 'Home goods and furniture'),
(5, 'Food', 'Food items and snacks'),
(6, 'Service', 'Services offered by students'),
(7, 'Appliance', 'Home appliances and kitchen items'),
(8, 'Apparel & Watch', 'Clothing and watches')
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
