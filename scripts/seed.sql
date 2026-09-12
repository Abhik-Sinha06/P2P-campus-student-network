-- ==============================================================================
-- P2P Student Micro-Lending Network Seed Data
-- ==============================================================================

-- Password for all seed users is: Student@123 (bcrypt hash below)
-- Admin password is: Admin@123
-- Hash for Student@123: $2a$10$7vI63Zc/2qF6.t2mHqD8a.G1B9W0eJ0yGf4.uA7lO8uXgR5nK6m4i (generated via bcryptjs)
-- Hash for Admin@123: $2a$10$WpP69dM7hP8kO4f1H5s9YeF7A8d1B2c3E4f5G6h7I8j9K0l1M2n3O

-- 1. SEED USERS
INSERT INTO users (name, email, password_hash, role, year, contact_info, karma_balance, is_verified, status)
VALUES 
('Abhik Sinha', 'abhik@vitstudent.ac.in', '$2a$10$e0my6m1fJz6Kk8U5cRk3ueE7J3Z3/2l.mS8F.4e7s9w8r5v1t9p0q', 'student', 2, '+91 98765 43210 (WhatsApp)', 70, TRUE, 'active'),
('Priya Sharma', 'priya.s@vitstudent.ac.in', '$2a$10$e0my6m1fJz6Kk8U5cRk3ueE7J3Z3/2l.mS8F.4e7s9w8r5v1t9p0q', 'student', 3, '+91 98111 22233 (Telegram: @priyavit)', 90, TRUE, 'active'),
('Rahul Kumar', 'rahul.k@vitstudent.ac.in', '$2a$10$e0my6m1fJz6Kk8U5cRk3ueE7J3Z3/2l.mS8F.4e7s9w8r5v1t9p0q', 'student', 1, '+91 97222 33344', 50, TRUE, 'active'),
('Sneha Patel', 'sneha.p@vitstudent.ac.in', '$2a$10$e0my6m1fJz6Kk8U5cRk3ueE7J3Z3/2l.mS8F.4e7s9w8r5v1t9p0q', 'student', 2, '+91 96333 44455', 40, TRUE, 'active'),
('System Administrator', 'admin@vitstudent.ac.in', '$2a$10$e0my6m1fJz6Kk8U5cRk3ueE7J3Z3/2l.mS8F.4e7s9w8r5v1t9p0q', 'admin', 4, 'admin-office@vitstudent.ac.in', 100, TRUE, 'active');

-- 2. SEED SKILLS
INSERT INTO skills (skill_name) VALUES 
('Python'),
('Data Structures & Algorithms'),
('Digital Logic Design'),
('Circuit Theory'),
('Next.js / React'),
('Machine Learning'),
('Arduino / Microcontrollers'),
('Database Management');

-- 3. SEED USER_SKILLS
INSERT INTO user_skills (user_id, skill_id) VALUES 
(1, 1), (1, 2), (1, 5), -- Abhik: Python, DSA, Next.js
(2, 3), (2, 4), (2, 7), -- Priya: Digital Logic, Circuit Theory, Arduino
(3, 1), (3, 8),         -- Rahul: Python, DBMS
(4, 2), (4, 6);         -- Sneha: DSA, Machine Learning

-- 4. SEED ITEMS
INSERT INTO items (owner_id, item_name, condition, available_from, available_to, status) VALUES 
(1, 'Casio fx-991EX ClassWiz Scientific Calculator', 'Excellent', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'available'),
(2, 'Arduino Uno R3 Starter Kit with Sensors', 'Like New', CURRENT_DATE, CURRENT_DATE + INTERVAL '14 days', 'available'),
(2, '65W Anker USB-C Fast Charger & Braided Cable', 'Good', CURRENT_DATE, CURRENT_DATE + INTERVAL '20 days', 'available'),
(3, 'Breadboard, Resistors and Jumper Wire Kit', 'Used', CURRENT_DATE, CURRENT_DATE + INTERVAL '10 days', 'available');

-- 5. SEED REQUESTS
INSERT INTO requests (requester_id, category, title, description, preferred_mode, campus_location, return_date, skills_required, status, created_date) VALUES 
(1, 'Academic', 'Need help understanding Dijkstra & Dynamic Programming for CAT-2', 'Struggling with graphs and state recurrence in DSA. Need a 45-min peer tutoring session over library study room or Google Meet.', 'in-person', 'Central Library, 2nd Floor', NULL, 'Data Structures & Algorithms', 'open', CURRENT_DATE),
(3, 'Item', 'Urgent: Casio fx-991EX calculator needed for tomorrow afternoon exam', 'Left my calculator at home and have Digital Electronics lab exam tomorrow at 2:00 PM. Will return right after 5:00 PM!', 'in-person', 'Technology Tower (TT) Ground Floor', CURRENT_DATE + INTERVAL '1 day', NULL, 'open', CURRENT_DATE),
(4, 'Project', 'Seeking teammate skilled in Next.js & Tailwind for Hackathon', 'Building a student utility app for Gravitas hackathon. Frontend layout is halfway done; need someone to help build the components.', 'online', 'Online / Discord', NULL, 'Next.js / React', 'open', CURRENT_DATE),
(2, 'Academic', 'Quick explanation on Microprocessor 8086 addressing modes', 'Completed exchange example for past syllabus topic.', 'in-person', 'SJT 4th Floor', NULL, 'Digital Logic Design', 'completed', CURRENT_DATE - INTERVAL '3 days');

-- 6. SEED OFFERS
INSERT INTO offers (request_id, helper_id, message, status, offer_date) VALUES 
(1, 4, 'Hey Abhik! I scored 95 in DSA last sem, happy to go over Dijkstra and DP with you at the Library tomorrow at 4 PM.', 'pending', CURRENT_DATE),
(2, 1, 'Hey Rahul! I have a spare fx-991EX you can borrow. Can hand it over outside TT canteen in the morning.', 'pending', CURRENT_DATE),
(4, 1, 'Helped Priya explain 8086 registers and memory segmentation.', 'accepted', CURRENT_DATE - INTERVAL '3 days');

-- 7. SEED EXCHANGES
INSERT INTO exchanges (request_id, requester_id, helper_id, due_date, completion_date, status) VALUES 
(4, 2, 1, CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE - INTERVAL '3 days', 'completed');

-- 8. SEED KARMA_TXNS (Notice: no timestamp column, as requested)
INSERT INTO karma_txns (user_id, exchange_id, amount, type) VALUES 
(1, NULL, 50, 'signup_bonus'),
(2, NULL, 50, 'signup_bonus'),
(3, NULL, 50, 'signup_bonus'),
(4, NULL, 50, 'signup_bonus'),
(5, NULL, 100, 'admin_adjustment'),
(1, 1, 20, 'help_provided'),       -- Abhik helped Priya (+20)
(2, 1, -10, 'request_fulfilled');   -- Priya received help (-10)

-- 9. SEED RATINGS
INSERT INTO ratings (exchange_id, rater_id, rated_id, score, comment) VALUES 
(1, 2, 1, 5, 'Super clear explanation of 8086 architecture! Highly recommended peer tutor.'),
(1, 1, 2, 5, 'Great study partner, punctual and came prepared with questions.');

-- 10. SEED REPORTS
INSERT INTO reports (reported_by_id, reported_user_id, reason, status, created_date) VALUES 
(4, 3, 'Spam duplicate requests posted in the feed.', 'pending', CURRENT_DATE);
