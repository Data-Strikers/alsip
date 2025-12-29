/**
 * API Service Layer
 * 
 * This abstraction layer allows easy migration from Lovable Cloud (Supabase)
 * to an external FastAPI + MySQL backend in the future.
 * 
 * To migrate: Replace the implementations below with fetch() calls to your external API.
 */

import { supabase } from "@/integrations/supabase/client";

// Types
export interface Goal {
  id: string;
  title: string;
  category: string;
  timeline: string;
  effort_level: string;
  progress: number | null;
  days_remaining: number | null;
  is_active: boolean | null;
  created_at: string;
}

export interface Skill {
  id: string;
  name: string;
  progress: number | null;
  goal_id: string;
  days_practiced: number | null;
  last_practiced_date: string | null;
  confidence_score: number | null;
  last_confidence_update: string | null;
}

export interface Streak {
  id: string;
  user_id: string;
  current_streak: number | null;
  longest_streak: number | null;
  last_activity_date: string | null;
  is_in_recovery: boolean | null;
  missed_days: number | null;
}

export interface LearningOutcome {
  id: string;
  user_id: string;
  skill_id: string;
  clarity_gain: number;
  confusion_note: string | null;
  difficulty_feeling: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  learning_style: string | null;
  resource_preference: string | null;
  strongest_skills: string[] | null;
  avatar_url: string | null;
}

export interface Resource {
  id: string;
  title: string;
  description: string | null;
  url: string;
  type: string;
  skill_category: string;
  cost: string;
  provider: string | null;
  difficulty: string | null;
  duration_minutes: number | null;
  rating: number | null;
  is_featured: boolean | null;
  has_certification: boolean | null;
}

// ============ AUTH APIs ============
// POST /login, POST /signup, GET /me

export const authService = {
  async signUp(email: string, password: string, displayName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },
};

// ============ GOAL APIs ============
// POST /goals, GET /goals/{user}

export const goalService = {
  async getGoals(userId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getActiveGoals(userId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createGoal(userId: string, goal: {
    title: string;
    category: string;
    timeline: string;
    effort_level: string;
    days_remaining: number;
  }): Promise<Goal> {
    const { data, error } = await supabase
      .from("goals")
      .insert({ ...goal, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<Goal> {
    const { data, error } = await supabase
      .from("goals")
      .update(updates)
      .eq("id", goalId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ============ SKILL APIs ============
// POST /skills, GET /skills/{goal}

export const skillService = {
  async getSkillsByGoal(goalId: string): Promise<Skill[]> {
    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .eq("goal_id", goalId);
    if (error) throw error;
    return data || [];
  },

  async getSkillsByUser(userId: string): Promise<Skill[]> {
    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;
    return data || [];
  },

  async createSkill(userId: string, goalId: string, name: string): Promise<Skill> {
    const { data, error } = await supabase
      .from("skills")
      .insert({ user_id: userId, goal_id: goalId, name, progress: 0 })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateSkill(skillId: string, updates: Partial<Skill>): Promise<Skill> {
    const { data, error } = await supabase
      .from("skills")
      .update(updates)
      .eq("id", skillId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async logPractice(skillId: string, currentDays: number): Promise<Skill> {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("skills")
      .update({
        days_practiced: currentDays + 1,
        last_practiced_date: today,
      })
      .eq("id", skillId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ============ STREAK APIs ============
// GET /streak/{user}

export const streakService = {
  async getStreak(userId: string): Promise<Streak | null> {
    const { data, error } = await supabase
      .from("streaks")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async updateStreak(userId: string, updates: Partial<Streak>): Promise<Streak> {
    const { data, error } = await supabase
      .from("streaks")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ============ LEARNING OUTCOME / REFLECTION APIs ============
// POST /reflection, GET /reflections/{user}

export const reflectionService = {
  async getReflections(userId: string): Promise<LearningOutcome[]> {
    const { data, error } = await supabase
      .from("learning_outcomes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getReflectionsBySkill(skillId: string): Promise<LearningOutcome[]> {
    const { data, error } = await supabase
      .from("learning_outcomes")
      .select("*")
      .eq("skill_id", skillId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createReflection(
    userId: string,
    skillId: string,
    clarityGain: number,
    confusionNote?: string,
    difficultyFeeling?: string
  ): Promise<LearningOutcome> {
    const { data, error } = await supabase
      .from("learning_outcomes")
      .insert({
        user_id: userId,
        skill_id: skillId,
        clarity_gain: clarityGain,
        confusion_note: confusionNote,
        difficulty_feeling: difficultyFeeling,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ============ PROFILE APIs ============
// GET /profile/{user}, PUT /profile/{user}

export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async completeOnboarding(
    userId: string,
    data: {
      display_name?: string;
      learning_style?: string;
      resource_preference?: string;
      current_goal?: string;
    }
  ): Promise<Profile> {
    const { data: profile, error } = await supabase
      .from("profiles")
      .update(data)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw error;
    return profile;
  },
};

// ============ RESOURCE APIs ============
// GET /resources?skill=xxx&cost=free|low|paid

export const resourceService = {
  async getResources(filters?: {
    skillCategory?: string;
    cost?: string;
    type?: string;
  }): Promise<Resource[]> {
    let query = supabase.from("resources").select("*");

    if (filters?.skillCategory) {
      query = query.eq("skill_category", filters.skillCategory);
    }
    if (filters?.cost) {
      query = query.eq("cost", filters.cost);
    }
    if (filters?.type) {
      query = query.eq("type", filters.type);
    }

    const { data, error } = await query.order("rating", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getFeaturedResources(): Promise<Resource[]> {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("is_featured", true)
      .order("rating", { ascending: false })
      .limit(5);
    if (error) throw error;
    return data || [];
  },
};

// ============ ANALYTICS / DAILY PLAN APIs ============
// GET /daily-plan/{user}/{date}, POST /daily-completion, POST /feedback

export const analyticsService = {
  async getConfidenceHistory(userId: string): Promise<{ date: string; score: number; skillName: string }[]> {
    const { data: skills, error: skillsError } = await supabase
      .from("skills")
      .select("id, name, confidence_score, last_confidence_update")
      .eq("user_id", userId);
    
    if (skillsError) throw skillsError;
    
    // Get learning outcomes for confidence trend
    const { data: outcomes, error: outcomesError } = await supabase
      .from("learning_outcomes")
      .select("skill_id, clarity_gain, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    
    if (outcomesError) throw outcomesError;
    
    // Build confidence history
    const history: { date: string; score: number; skillName: string }[] = [];
    
    skills?.forEach(skill => {
      const skillOutcomes = outcomes?.filter(o => o.skill_id === skill.id) || [];
      let runningScore = 0;
      
      skillOutcomes.forEach(outcome => {
        runningScore = Math.min(10, runningScore + (outcome.clarity_gain * 2));
        history.push({
          date: outcome.created_at.split("T")[0],
          score: runningScore,
          skillName: skill.name,
        });
      });
      
      // Add current confidence if exists
      if (skill.confidence_score && skill.last_confidence_update) {
        history.push({
          date: skill.last_confidence_update,
          score: skill.confidence_score,
          skillName: skill.name,
        });
      }
    });
    
    return history.sort((a, b) => a.date.localeCompare(b.date));
  },

  async getStreakHistory(userId: string): Promise<{ date: string; streak: number }[]> {
    // For now, we'll simulate based on current streak
    // In a real implementation, you'd track this in a separate table
    const streak = await streakService.getStreak(userId);
    const history: { date: string; streak: number }[] = [];
    
    if (streak?.current_streak) {
      const today = new Date();
      for (let i = streak.current_streak - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        history.push({
          date: date.toISOString().split("T")[0],
          streak: streak.current_streak - i,
        });
      }
    }
    
    return history;
  },

  async getTimeInvestedBySkill(userId: string): Promise<{ skill: string; minutes: number; days: number }[]> {
    const { data: skills, error } = await supabase
      .from("skills")
      .select("name, days_practiced")
      .eq("user_id", userId);
    
    if (error) throw error;
    
    // Assume average 30 minutes per practice session
    return (skills || []).map(skill => ({
      skill: skill.name,
      minutes: (skill.days_practiced || 0) * 30,
      days: skill.days_practiced || 0,
    }));
  },
};
