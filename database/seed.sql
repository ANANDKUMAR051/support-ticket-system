USE support_ticket_system;

-- Password for both demo users: Password@123
-- bcrypt hash generated for the seed account.
INSERT INTO users (name, email, password_hash, role) VALUES
('Demo Customer', 'customer@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'CUSTOMER'),
('Demo Agent', 'agent@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'AGENT');

INSERT INTO tickets
(user_id, subject, description, priority, status, assigned_to)
VALUES
(1, 'Unable to access account', 'The customer cannot access the support portal after resetting the password.', 'HIGH', 'OPEN', 2),
(1, 'Billing question', 'Please explain the latest invoice amount.', 'MEDIUM', 'IN_PROGRESS', 2);

INSERT INTO ticket_comments (ticket_id, user_id, comment) VALUES
(1, 1, 'I am unable to access my account.'),
(1, 2, 'We are checking the account and will respond shortly.'),
(2, 1, 'Could you please clarify the additional charge?');
