-- CivicConnect AI PostgreSQL Sample Seed Data
-- Passwords below are pre-hashed with bcrypt for 'Admin@123' and 'Citizen@123'

INSERT INTO users (name, email, password_hash, role, preferred_language, area)
VALUES 
('Civic Administrator', 'admin@civicconnect.org', '$2b$12$eG8r9P9b8hH9O6kQJ8tLg.0Xj4yYhO/1PjXgXJpW7e1A4P4s1S7Ua', 'admin', 'en', 'Central Ward'),
('Pooja Sharma', 'citizen@civicconnect.org', '$2b$12$eG8r9P9b8hH9O6kQJ8tLg.0Xj4yYhO/1PjXgXJpW7e1A4P4s1S7Ua', 'citizen', 'en', 'Shivaji Nagar'),
('Rahul Deshmukh', 'rahul@civicconnect.org', '$2b$12$eG8r9P9b8hH9O6kQJ8tLg.0Xj4yYhO/1PjXgXJpW7e1A4P4s1S7Ua', 'citizen', 'mr', 'Kothrud')
ON CONFLICT (email) DO NOTHING;

INSERT INTO services (category, service_name, description, area, contact_number, working_hours)
VALUES
('Waste Management', 'Shivaji Nagar Sanitation Division', 'Door-to-door segregated wet and dry waste collection.', 'Shivaji Nagar', '020-25501234', '06:30 AM - 02:00 PM'),
('Waste Management', 'Kothrud Solid Waste & Recycling Center', 'Daily residential garbage rounds and e-waste collection.', 'Kothrud', '020-25445678', '07:00 AM - 02:30 PM'),
('Waste Management', 'Hadapsar Municipal Waste Management', 'Household waste collection and road sweeping.', 'Hadapsar', '020-26871122', '06:00 AM - 01:30 PM'),
('Public Transport', 'PMPML Route 101: Swargate to Shivaji Nagar Depot', 'High frequency trunk corridor connecting major terminals.', 'Shivaji Nagar', '020-24440417', '06:00 AM - 11:00 PM'),
('Public Transport', 'PMPML Route 202: Kothrud Depot to Pune Station', 'Direct commuter route via Karve Road and Deccan.', 'Kothrud', '020-25440212', '06:30 AM - 10:30 PM'),
('Public Transport', 'PMPML Route 303: Hadapsar Gadital to Hinjawadi Phase 3', 'IT park express bus.', 'Hadapsar', '020-26870344', '07:00 AM - 09:30 PM'),
('Water Supply', 'Municipal Water Supply & Sewerage Board', 'Drinking water supply and pipeline repair helpline.', 'All Areas', '020-24443333', '24/7 Grievance Line'),
('Electricity', 'MSEDCL Electricity Distribution Board', 'Power outage helpline and feeder maintenance.', 'All Areas', '1912', '24/7 Emergency Line'),
('Emergency', 'Police Emergency Control Room', 'Immediate law enforcement and safety dispatch.', 'All Areas', '100', '24/7'),
('Emergency', 'Municipal Fire Brigade & Rescue', 'Fire fighting and disaster containment.', 'All Areas', '101', '24/7'),
('Emergency', 'National Emergency Ambulance Service', 'Advanced medical life support transport.', 'All Areas', '108', '24/7'),
('Emergency', 'Women in Distress Helpline', 'Toll-free emergency protection for women.', 'All Areas', '1091', '24/7'),
('Healthcare', 'Civil General Hospital & Trauma Center', 'Public hospital with round-the-clock emergency ICU.', 'Central Ward', '020-26127777', '24/7');

INSERT INTO announcements (title, description, area, priority)
VALUES
('Scheduled Water Pipeline Maintenance', 'Planned 12-hour water shutdown for Khadakwasla main conduit interconnection.', 'Shivaji Nagar', 'CRITICAL'),
('Pre-Monsoon Road Resurfacing & Pothole Repair', 'Resurfacing operations underway across Kothrud arterial roads.', 'Kothrud', 'IMPORTANT'),
('Mandatory Household Waste Segregation Alert', 'Strict segregation of wet, dry, and sanitary waste required under municipal bye-laws.', 'All Areas', 'NORMAL');
