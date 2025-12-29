import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { DailyPlanCard } from "@/components/dashboard/DailyPlanCard";
import { StreakCard } from "@/components/dashboard/StreakCard";
import { GoalProgressCard } from "@/components/dashboard/GoalProgressCard";
import { CreateGoalModal } from "@/components/dashboard/CreateGoalModal";
import { ResourceLibrary } from "@/components/dashboard/ResourceLibrary";
import { Plus, Calendar, Bell, Settings, Loader2, Target } from "lucide-react";
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
}

// Mock data for demonstration
const mockDailyTasks = [
  {
    id: "1",
    type: "micro-concept" as const,
    title: "Understanding List Comprehensions",
    description:
      "Learn how to create lists using concise, readable Python syntax.",
    duration: 15,
    completed: false,
  },
  {
    id: "2",
    type: "practical" as const,
    title: "Build a Data Filter",
    description:
      "Apply list comprehensions to filter and transform a dataset.",
    duration: 20,
    completed: false,
  },
  {
    id: "3",
    type: "variation" as const,
    title: "Quiz: Comprehension Patterns",
    description: "Test your understanding with 5 quick questions.",
    duration: 10,
    completed: false,
  },
  {
    id: "4",
    type: "reflection" as const,
    title: "Daily Reflection",
    description:
      "What was the most useful thing you learned today? Where can you apply it?",
    duration: 5,
    completed: false,
  },
];

const mockWeekData = [
  { day: "Mon", completed: true },
  { day: "Tue", completed: true },
  { day: "Wed", completed: true },
  { day: "Thu", completed: true },
  { day: "Fri", completed: false },
  { day: "Sat", completed: false },
  { day: "Sun", completed: false },
];

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
  const [displayName, setDisplayName] = useState("");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      // Get display name from user metadata
      const name = user.user_metadata?.display_name || user.email?.split("@")[0] || "Learner";
      setDisplayName(name);
      fetchGoalsAndSkills();
    }
  }, [user]);

  const fetchGoalsAndSkills = async () => {
    if (!user) return;
    
    setGoalsLoading(true);
    
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
      }
    }
    
    setGoalsLoading(false);
  };

  const handleCreateGoal = async (goal: {
    title: string;
    category: string;
    timeline: string;
    effort: string;
  }) => {
    if (!user) return;

    // Calculate days remaining based on timeline
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
      fetchGoalsAndSkills(); // Refresh goals
    }
  };

  const activeGoal = goals[0];
  const formattedSkills = skills.map((skill, index) => ({
    name: skill.name,
    progress: skill.progress || 0,
    color: skillColors[index % skillColors.length],
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
                Good morning, {displayName}! 👋
              </h1>
              <p className="text-muted-foreground">
                Ready for today's learning session? Let's make progress together.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon">
                <Calendar className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="w-4 h-4" />
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

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Daily Plan */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">
                    Today's Learning Plan
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <DailyPlanCard
                  mode="application"
                  skill="Python Programming"
                  tasks={mockDailyTasks}
                  onTaskComplete={(id) =>
                    toast("Task completed!", {
                      description: "Great job! Keep going.",
                    })
                  }
                  onStartSession={() =>
                    toast("Session started!", {
                      description: "Focus mode activated. You got this!",
                    })
                  }
                />
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              >
                {[
                  { label: "Browse Resources", icon: "📚", color: "mode-concept" },
                  { label: "Review Progress", icon: "📊", color: "mode-application" },
                  { label: "Join Community", icon: "👥", color: "mode-analysis" },
                  { label: "Get Help", icon: "💡", color: "mode-review" },
                ].map((action, index) => (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="p-4 rounded-xl bg-card border border-border/50 shadow-card hover:shadow-medium transition-all duration-200 hover:-translate-y-0.5 text-center"
                  >
                    <span className="text-2xl mb-2 block">{action.icon}</span>
                    <span className="text-sm font-medium text-foreground">
                      {action.label}
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <StreakCard
                currentStreak={4}
                longestStreak={12}
                weekData={mockWeekData}
              />
              {activeGoal ? (
                <GoalProgressCard
                  goalName={activeGoal.title}
                  overallProgress={activeGoal.progress || 0}
                  skills={formattedSkills.length > 0 ? formattedSkills : [
                    { name: "Getting started...", progress: 0, color: skillColors[0] }
                  ]}
                  daysRemaining={activeGoal.days_remaining || 0}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl border border-border/50 shadow-card p-6 text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">No Active Goals</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Set a learning goal to start tracking your progress
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreateGoalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Create Goal
                  </Button>
                </motion.div>
              )}
              <ResourceLibrary />
            </div>
          </div>
        </div>
      </main>

      {/* Create Goal Modal */}
      <CreateGoalModal
        isOpen={isCreateGoalOpen}
        onClose={() => setIsCreateGoalOpen(false)}
        onSubmit={handleCreateGoal}
      />
    </div>
  );
}
