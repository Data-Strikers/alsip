-- Create learning_outcomes table for post-practice reflection
CREATE TABLE public.learning_outcomes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  clarity_gain INTEGER NOT NULL CHECK (clarity_gain >= 1 AND clarity_gain <= 5),
  confusion_note TEXT,
  difficulty_feeling TEXT CHECK (difficulty_feeling IN ('too_easy', 'just_right', 'too_hard')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add confidence_score to skills table (1-10, updated weekly)
ALTER TABLE public.skills 
ADD COLUMN confidence_score INTEGER DEFAULT NULL CHECK (confidence_score >= 1 AND confidence_score <= 10),
ADD COLUMN last_confidence_update DATE DEFAULT NULL;

-- Add recovery mode fields to streaks table
ALTER TABLE public.streaks
ADD COLUMN is_in_recovery BOOLEAN DEFAULT false,
ADD COLUMN recovery_started_at DATE DEFAULT NULL,
ADD COLUMN missed_days INTEGER DEFAULT 0;

-- Add learning identity fields to profiles
ALTER TABLE public.profiles
ADD COLUMN strongest_skills TEXT[] DEFAULT '{}',
ADD COLUMN learning_style TEXT CHECK (learning_style IN ('consistent', 'burst', 'recovery', NULL)),
ADD COLUMN resource_preference TEXT CHECK (resource_preference IN ('free', 'low_cost', 'any', NULL));

-- Enable RLS on learning_outcomes
ALTER TABLE public.learning_outcomes ENABLE ROW LEVEL SECURITY;

-- RLS policies for learning_outcomes
CREATE POLICY "Users can view their own learning outcomes"
ON public.learning_outcomes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own learning outcomes"
ON public.learning_outcomes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning outcomes"
ON public.learning_outcomes FOR UPDATE
USING (auth.uid() = user_id);

-- Add delete policy for skills (was missing)
CREATE POLICY "Users can delete their own skills"
ON public.skills FOR DELETE
USING (auth.uid() = user_id);