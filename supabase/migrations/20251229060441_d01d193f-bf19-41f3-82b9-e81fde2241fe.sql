-- Add certification availability column to resources
ALTER TABLE public.resources 
ADD COLUMN has_certification BOOLEAN DEFAULT false;

-- Update existing resources with certification info
UPDATE public.resources SET has_certification = true WHERE provider IN ('Coursera', 'edX', 'Udemy') AND type = 'course';
UPDATE public.resources SET has_certification = false WHERE provider IN ('freeCodeCamp', 'Khan Academy', 'The Odin Project');