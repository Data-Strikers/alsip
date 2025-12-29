import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { DailyPlanCard } from "@/components/dashboard/DailyPlanCard";
import { StreakCard } from "@/components/dashboard/StreakCard";
import { GoalProgressCard } from "@/components/dashboard/GoalProgressCard";
import { CreateGoalModal } from "@/components/dashboard/CreateGoalModal";
import { Plus, Calendar, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

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

const mockSkills = [
  { name: "Python Basics", progress: 85, color: "var(--mode-concept)" },
  { name: "Data Structures", progress: 62, color: "var(--mode-application)" },
  { name: "Functions & OOP", progress: 45, color: "var(--mode-analysis)" },
  { name: "File Handling", progress: 28, color: "var(--mode-review)" },
];

export default function Dashboard() {
  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false);

  const handleCreateGoal = (goal: {
    title: string;
    category: string;
    timeline: string;
    effort: string;
  }) => {
    toast.success("Goal created successfully!", {
      description: `"${goal.title}" has been added to your learning path.`,
    });
    setIsCreateGoalOpen(false);
  };

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
                Good morning, Learner! 👋
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
                    Thursday, Dec 28
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
              <GoalProgressCard
                goalName="Learn Python in 3 Months"
                overallProgress={48}
                skills={mockSkills}
                daysRemaining={45}
              />
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
