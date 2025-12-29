import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { StreakCard } from "@/components/dashboard/StreakCard";
import { GoalProgressCard } from "@/components/dashboard/GoalProgressCard";
import { CreateGoalModal } from "@/components/dashboard/CreateGoalModal";
import { AddSkillModal } from "@/components/dashboard/AddSkillModal";
import { ResourceLibrary } from "@/components/dashboard/ResourceLibrary";
import { SkillSuggestionsCard } from "@/components/dashboard/SkillSuggestionsCard";
import { LearningOutcomeModal } from "@/components/dashboard/LearningOutcomeModal";
import { ConfidenceUpdateModal } from "@/components/dashboard/ConfidenceUpdateModal";
import { RecoveryModeCard } from "@/components/dashboard/RecoveryModeCard";
import { Plus, Calendar, Bell, User, Loader2, Target, Sparkles, BookOpen, Check, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Goal {
  id: string;
  title: string;
  category: string;
  timeline: string;
  effort_level: string;
  progress: number | null;
  days_remaining: number | null;
  is_active: boolean | null;
}

interface Skill {
  id: string;
  name: string;
  progress: number | null;
  goal_id: string;
  days_practiced: number | null;
  last_practiced_date: string | null;
  confidence_score: number | null;
  last_confidence_update: string | null;
}

interface Streak {
  current_streak: number | null;
  longest_streak: number | null;
  last_activity_date: string | null;
  is_in_recovery: boolean | null;
  missed_days: number | null;
}

const skillColors = [
  "var(--primary)",
  "210 80% 50%",
  "200 70% 45%",
  "220 75% 55%",
];

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false);
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [isConfidenceModalOpen, setIsConfidenceModalOpen] = useState(false);
  const [selectedSkillForOutcome, setSelectedSkillForOutcome] = useState<Skill | null>(null);
  const [selectedSkillForConfidence, setSelectedSkillForConfidence] = useState<Skill | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      const name = user.user_metadata?.display_name || user.email?.split("@")[0] || "Learner";
      setDisplayName(name);
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    setDataLoading(true);
    
    // Fetch goals
    const { data: goalsData, error: goalsError } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (goalsError) {
      console.error("Error fetching goals:", goalsError);
    } else if (goalsData) {
      setGoals(goalsData);
      
      // Fetch skills for the first active goal
      if (goalsData.length > 0) {
        const { data: skillsData, error: skillsError } = await supabase
          .from("skills")
          .select("*")
          .eq("goal_id", goalsData[0].id);

        if (skillsError) {
          console.error("Error fetching skills:", skillsError);
        } else if (skillsData) {
          setSkills(skillsData);
        }
      } else {
        setSkills([]);
      }
    }

    // Fetch streak
    const { data: streakData, error: streakError } = await supabase
      .from("streaks")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (streakError) {
      console.error("Error fetching streak:", streakError);
    } else if (streakData) {
      setStreak(streakData);
    }
    
    setDataLoading(false);
  };

  const handleCreateGoal = async (goal: {
    title: string;
    category: string;
    timeline: string;
    effort: string;
  }) => {
    if (!user) return;

    const daysMap: Record<string, number> = {
      "1month": 30,
      "3months": 90,
      "6months": 180,
      "1year": 365,
    };

    const { error } = await supabase.from("goals").insert({
      user_id: user.id,
      title: goal.title,
      category: goal.category,
      timeline: goal.timeline,
      effort_level: goal.effort,
      days_remaining: daysMap[goal.timeline] || 90,
    });

    if (error) {
      toast.error("Failed to create goal. Please try again.");
      console.error("Error creating goal:", error);
    } else {
      toast.success("Goal created successfully!", {
        description: `"${goal.title}" has been added to your learning path.`,
      });
      setIsCreateGoalOpen(false);
      fetchData();
    }
  };

  const handleAddSkill = async (skillName: string) => {
    if (!user || !activeGoal) return;

    const { error } = await supabase.from("skills").insert({
      user_id: user.id,
      goal_id: activeGoal.id,
      name: skillName,
      progress: 0,
    });

    if (error) {
      toast.error("Failed to add skill. Please try again.");
      console.error("Error adding skill:", error);
    } else {
      toast.success("Skill added!", {
        description: `"${skillName}" is now being tracked.`,
      });
      fetchData();
    }
  };

  const handleLogPractice = async (skillId: string) => {
    const skill = skills.find((s) => s.id === skillId);
    if (!skill) return;

    const today = new Date().toISOString().split("T")[0];
    const lastPracticed = skill.last_practiced_date;

    // Check if already practiced today
    if (lastPracticed === today) {
      toast.info("Already logged today!", {
        description: "Come back tomorrow to log more practice.",
      });
      return;
    }

    const newDays = (skill.days_practiced || 0) + 1;

    const { error } = await supabase
      .from("skills")
      .update({ 
        days_practiced: newDays,
        last_practiced_date: today,
      })
      .eq("id", skillId);

    if (error) {
      toast.error("Failed to log practice.");
      console.error("Error updating skill:", error);
    } else {
      // Open Learning Outcome Modal for reflection
      setSelectedSkillForOutcome(skill);
      setIsOutcomeModalOpen(true);
      fetchData();
    }
  };

  // Check if skill needs weekly confidence update
  const needsConfidenceUpdate = (skill: Skill) => {
    if (!skill.last_confidence_update) return skill.days_practiced && skill.days_practiced >= 7;
    const lastUpdate = new Date(skill.last_confidence_update);
    const daysSinceUpdate = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceUpdate >= 7;
  };

  // Check for recovery mode
  const isInRecoveryMode = streak?.is_in_recovery || (streak?.missed_days && streak.missed_days >= 2);

  const handleStartRecovery = () => {
    toast.success("Recovery mode started!", {
      description: "Take it easy today. Small progress counts.",
    });
  };

  const activeGoal = goals[0];
  const formattedSkills = skills.map((skill, index) => ({
    id: skill.id,
    name: skill.name,
    progress: skill.progress || 0,
    color: skillColors[index % skillColors.length],
  }));

  // Calculate overall goal progress from skills
  const overallProgress = skills.length > 0
    ? Math.round(skills.reduce((acc, s) => acc + (s.progress || 0), 0) / skills.length)
    : 0;

  // Generate week data based on streak
  const getWeekData = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    return days.map((day, index) => {
      const completed = streak?.current_streak 
        ? index < (streak.current_streak % 7) 
        : false;
      return { day, completed };
    });
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const hasNoData = goals.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                Welcome, {displayName}!
              </h1>
              <p className="text-muted-foreground">
                {hasNoData 
                  ? "Let's set up your first learning goal to get started."
                  : "Track your progress and bridge your skill gaps."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon">
                <Calendar className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigate("/profile")}>
                <User className="w-4 h-4" />
              </Button>
              <Button
                variant="hero"
                onClick={() => setIsCreateGoalOpen(true)}
              >
                <Plus className="w-4 h-4" />
                New Goal
              </Button>
            </div>
          </motion.div>

          {/* Empty State for New Users */}
          {hasNoData ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Main Empty State */}
              <div className="lg:col-span-2">
                <div className="bg-card rounded-2xl border border-border/50 shadow-card p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-3">
                    Start Your Learning Journey
                  </h2>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    Create your first goal to begin tracking your skill development. 
                    We'll help you identify gaps and build a personalized learning path.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                      variant="hero"
                      size="lg"
                      onClick={() => setIsCreateGoalOpen(true)}
                    >
                      <Plus className="w-5 h-5" />
                      Create Your First Goal
                    </Button>
                  </div>

                  {/* Quick Tips */}
                  <div className="mt-8 pt-8 border-t border-border/50">
                    <h3 className="text-sm font-medium text-foreground mb-4">
                      How ALSIP Helps You
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { icon: Target, title: "Set Goals", desc: "Define what you want to learn" },
                        { icon: Sparkles, title: "Track Skills", desc: "Add skills and monitor progress" },
                        { icon: BookOpen, title: "Learn", desc: "Access free curated resources" },
                      ].map((tip) => (
                        <div key={tip.title} className="p-4 rounded-xl bg-muted/50">
                          <tip.icon className="w-5 h-5 text-primary mb-2" />
                          <h4 className="font-medium text-foreground text-sm">{tip.title}</h4>
                          <p className="text-xs text-muted-foreground">{tip.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <StreakCard
                  currentStreak={streak?.current_streak || 0}
                  longestStreak={streak?.longest_streak || 0}
                  weekData={getWeekData()}
                />
                <ResourceLibrary />
              </div>
            </motion.div>
          ) : (
            /* Dashboard with Data */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Goals List */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground">
                      Your Goals
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      {goals.length} active goal{goals.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {goals.map((goal, index) => (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-card rounded-xl border border-border/50 shadow-card p-5"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-foreground">{goal.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {goal.category} • {goal.days_remaining} days remaining
                            </p>
                          </div>
                          <span className="text-sm font-medium text-primary">
                            {goal.progress || 0}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${goal.progress || 0}%` }}
                            transition={{ duration: 0.8 }}
                            className="h-full rounded-full gradient-primary"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Skills Section */}
                {activeGoal && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-foreground">
                        Skills for: {activeGoal.title}
                      </h2>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddSkillOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Skill
                      </Button>
                    </div>
                    
                    {skills.length === 0 ? (
                      <div className="bg-card rounded-xl border border-border/50 shadow-card p-6 text-center">
                        <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
                        <p className="text-muted-foreground mb-4">
                          No skills added yet. Add skills to track your progress.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsAddSkillOpen(true)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Your First Skill
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {skills.map((skill, index) => {
                          const today = new Date().toISOString().split("T")[0];
                          const practicedToday = skill.last_practiced_date === today;
                          return (
                            <motion.div
                              key={skill.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className="bg-card rounded-xl border border-border/50 shadow-card p-4"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-foreground">{skill.name}</span>
                                <div className="flex items-center gap-2">
                                  {skill.confidence_score && (
                                    <span className="text-xs text-muted-foreground">
                                      Confidence: {skill.confidence_score}/10
                                    </span>
                                  )}
                                  <span className="text-sm text-primary font-semibold">
                                    {skill.days_practiced || 0} days
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mb-3">
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((skill.days_practiced || 0) * 3.33, 100)}%` }}
                                    transition={{ duration: 0.6 }}
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: `hsl(${skillColors[index % skillColors.length]})` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {skill.days_practiced || 0}/30
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant={practicedToday ? "outline" : "default"}
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleLogPractice(skill.id)}
                                  disabled={practicedToday}
                                >
                                  {practicedToday ? (
                                    <>
                                      <Check className="w-4 h-4 mr-1" />
                                      Done
                                    </>
                                  ) : (
                                    <>
                                      <Calendar className="w-4 h-4 mr-1" />
                                      Log Practice
                                    </>
                                  )}
                                </Button>
                                {needsConfidenceUpdate(skill) && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedSkillForConfidence(skill);
                                      setIsConfidenceModalOpen(true);
                                    }}
                                  >
                                    <TrendingUp className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* AI Skill Suggestions */}
                {activeGoal && user && (
                  <SkillSuggestionsCard
                    goalId={activeGoal.id}
                    goalTitle={activeGoal.title}
                    category={activeGoal.category}
                    existingSkills={skills.map((s) => s.name)}
                    onSkillAdded={fetchData}
                    userId={user.id}
                  />
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {isInRecoveryMode && (
                  <RecoveryModeCard
                    missedDays={streak?.missed_days || 2}
                    onStartRecovery={handleStartRecovery}
                  />
                )}
                <StreakCard
                  currentStreak={streak?.current_streak || 0}
                  longestStreak={streak?.longest_streak || 0}
                  weekData={getWeekData()}
                />
                {activeGoal && (
                  <GoalProgressCard
                    goalName={activeGoal.title}
                    overallProgress={overallProgress}
                    skills={formattedSkills.length > 0 ? formattedSkills : []}
                    daysRemaining={activeGoal.days_remaining || 0}
                    onAddSkill={() => setIsAddSkillOpen(true)}
                  />
                )}
                <ResourceLibrary />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <CreateGoalModal
        isOpen={isCreateGoalOpen}
        onClose={() => setIsCreateGoalOpen(false)}
        onSubmit={handleCreateGoal}
      />
      {activeGoal && (
        <AddSkillModal
          isOpen={isAddSkillOpen}
          onClose={() => setIsAddSkillOpen(false)}
          onSubmit={handleAddSkill}
          goalTitle={activeGoal.title}
        />
      )}
      {selectedSkillForOutcome && user && (
        <LearningOutcomeModal
          isOpen={isOutcomeModalOpen}
          onClose={() => setIsOutcomeModalOpen(false)}
          skillId={selectedSkillForOutcome.id}
          skillName={selectedSkillForOutcome.name}
          userId={user.id}
          onComplete={fetchData}
        />
      )}
      {selectedSkillForConfidence && (
        <ConfidenceUpdateModal
          isOpen={isConfidenceModalOpen}
          onClose={() => setIsConfidenceModalOpen(false)}
          skillId={selectedSkillForConfidence.id}
          skillName={selectedSkillForConfidence.name}
          currentConfidence={selectedSkillForConfidence.confidence_score}
          onComplete={fetchData}
        />
      )}
    </div>
  );
}
