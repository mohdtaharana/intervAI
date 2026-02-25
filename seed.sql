-- Seed admin user (password: admin123)
INSERT OR IGNORE INTO users (id, email, password_hash, name, role) VALUES 
  ('usr_admin_001', 'admin@aiinterview.com', '$admin_hash$', 'Admin User', 'admin');

-- Seed demo user (password: demo123)
INSERT OR IGNORE INTO users (id, email, password_hash, name, role) VALUES 
  ('usr_demo_001', 'demo@aiinterview.com', '$demo_hash$', 'Demo User', 'user');
