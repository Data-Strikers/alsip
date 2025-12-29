-- Add days_practiced column to skills table
ALTER TABLE public.skills 
ADD COLUMN days_practiced INTEGER DEFAULT 0,
ADD COLUMN last_practiced_date DATE;

-- Update progress column comment to clarify it's percentage
COMMENT ON COLUMN public.skills.progress IS 'Learning progress percentage (0-100)';
COMMENT ON COLUMN public.skills.days_practiced IS 'Total days the user practiced this skill';