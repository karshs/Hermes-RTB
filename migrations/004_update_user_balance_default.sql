-- Update default balance for new users to 100,000
ALTER TABLE users ALTER COLUMN balance SET DEFAULT 100000.00;

-- Top up existing users who still have the old default of 1000 or less
UPDATE users SET balance = 100000.00 WHERE balance <= 1000.00;
