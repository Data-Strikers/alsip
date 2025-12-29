-- Create resources table for learning materials
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('course', 'article', 'video', 'tutorial', 'book')),
  skill_category TEXT NOT NULL,
  cost TEXT NOT NULL DEFAULT 'free' CHECK (cost IN ('free', 'low-cost', 'paid')),
  provider TEXT,
  duration_minutes INTEGER,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  rating DECIMAL(2,1),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Resources are public/readable by everyone (free educational content)
CREATE POLICY "Resources are publicly readable"
ON public.resources
FOR SELECT
USING (true);

-- Only admins can modify resources (we'll seed data via migration)
-- For now, no insert/update/delete policies for regular users

-- Seed with free learning resources
INSERT INTO public.resources (title, description, url, type, skill_category, cost, provider, duration_minutes, difficulty, rating, is_featured) VALUES
-- Data Science & Analytics
('Python for Data Science', 'Comprehensive Python course for data analysis and visualization', 'https://www.coursera.org/learn/python-for-data-science', 'course', 'Data Science', 'free', 'Coursera', 240, 'beginner', 4.7, true),
('SQL Fundamentals', 'Master SQL queries and database management', 'https://www.khanacademy.org/computing/computer-programming/sql', 'course', 'Data Science', 'free', 'Khan Academy', 180, 'beginner', 4.5, false),
('Statistics Fundamentals', 'Learn statistical analysis from scratch', 'https://www.khanacademy.org/math/statistics-probability', 'course', 'Data Science', 'free', 'Khan Academy', 300, 'beginner', 4.6, false),

-- Cloud & DevOps
('AWS Cloud Practitioner Essentials', 'Official AWS cloud fundamentals training', 'https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/', 'course', 'Cloud Computing', 'free', 'AWS', 360, 'beginner', 4.8, true),
('Docker Getting Started', 'Official Docker tutorial for containerization', 'https://docs.docker.com/get-started/', 'tutorial', 'DevOps', 'free', 'Docker', 120, 'beginner', 4.5, false),
('Kubernetes Basics', 'Introduction to container orchestration', 'https://kubernetes.io/docs/tutorials/kubernetes-basics/', 'tutorial', 'DevOps', 'free', 'Kubernetes', 180, 'intermediate', 4.4, false),

-- AI & Machine Learning
('Machine Learning Crash Course', 'Google''s fast-paced ML introduction', 'https://developers.google.com/machine-learning/crash-course', 'course', 'Machine Learning', 'free', 'Google', 900, 'intermediate', 4.9, true),
('Deep Learning Specialization', 'Comprehensive deep learning course by Andrew Ng', 'https://www.coursera.org/specializations/deep-learning', 'course', 'Machine Learning', 'free', 'Coursera', 1200, 'advanced', 4.9, true),
('Intro to AI with Python', 'Harvard''s CS50 AI course', 'https://cs50.harvard.edu/ai/', 'course', 'Machine Learning', 'free', 'Harvard', 600, 'intermediate', 4.8, false),

-- Web Development
('The Odin Project', 'Full-stack web development curriculum', 'https://www.theodinproject.com/', 'course', 'Web Development', 'free', 'The Odin Project', 2400, 'beginner', 4.8, true),
('React Documentation', 'Official React learning guide', 'https://react.dev/learn', 'tutorial', 'Web Development', 'free', 'React', 300, 'beginner', 4.7, false),
('JavaScript.info', 'Modern JavaScript tutorial', 'https://javascript.info/', 'tutorial', 'Web Development', 'free', 'JavaScript.info', 600, 'beginner', 4.6, false),

-- Cybersecurity
('Cybersecurity Fundamentals', 'IBM''s intro to cybersecurity', 'https://www.coursera.org/learn/intro-cyber-security', 'course', 'Cybersecurity', 'free', 'IBM', 480, 'beginner', 4.5, false),
('OWASP Top 10', 'Learn about web security vulnerabilities', 'https://owasp.org/www-project-top-ten/', 'article', 'Cybersecurity', 'free', 'OWASP', 60, 'intermediate', 4.7, true),

-- Project Management
('Agile with Atlassian Jira', 'Learn agile methodology and Jira', 'https://www.coursera.org/learn/agile-atlassian-jira', 'course', 'Project Management', 'free', 'Atlassian', 240, 'beginner', 4.4, false),
('Scrum Guide', 'Official Scrum framework guide', 'https://scrumguides.org/', 'article', 'Project Management', 'free', 'Scrum.org', 30, 'beginner', 4.5, false),

-- Communication & Leadership
('Effective Communication', 'Improve workplace communication skills', 'https://www.coursera.org/learn/wharton-communication-skills', 'course', 'Communication', 'free', 'Wharton', 180, 'beginner', 4.3, false),
('Leadership Foundations', 'Develop essential leadership skills', 'https://www.linkedin.com/learning/leadership-foundations', 'course', 'Leadership', 'low-cost', 'LinkedIn Learning', 120, 'beginner', 4.4, false);