-- Add subscription fields to tutors table
-- Run this in Supabase SQL Editor

-- Add subscription_status column
ALTER TABLE tutors 
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'inactive' 
CHECK (subscription_status IN ('active', 'inactive', 'trial', 'expired'));

-- Add subscription_expiry column
ALTER TABLE tutors 
ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMP WITH TIME ZONE;

-- Add trial_start column
ALTER TABLE tutors 
ADD COLUMN IF NOT EXISTS trial_start TIMESTAMP WITH TIME ZONE;

-- Add trial_end column
ALTER TABLE tutors 
ADD COLUMN IF NOT EXISTS trial_end TIMESTAMP WITH TIME ZONE;

-- Create index for faster subscription lookups
CREATE INDEX IF NOT EXISTS idx_tutors_subscription_status 
ON tutors(subscription_status);

-- Update existing admin users to have active subscription
UPDATE tutors 
SET subscription_status = 'active' 
WHERE role = 'admin' AND subscription_status IS NULL;

-- Update existing users with free plan to have active subscription
UPDATE tutors 
SET subscription_status = 'active' 
WHERE plan_type = 'free' AND subscription_status IS NULL;
