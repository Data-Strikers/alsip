import { motion } from "framer-motion";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Lightbulb,
  MessageSquare,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type LearningMode = "concept" | "application" | "analysis" | "review" | "revision";

interface DailyTask {
  id: string;
  type: "micro-concept" | "practical" | "variation" | "reflection";
  title: string;
  description: string;
  duration: number;
  completed: boolean;
}

interface DailyPlanCardProps {
  mode: LearningMode;
  skill: string;
  tasks: DailyTask[];
  onTaskComplete?: (taskId: string) => void;
  onStartSession?: () => void;
}

const modeConfig: Record<
  LearningMode,
  { label: string; color: string; icon: React.ElementType; bgClass: string }
> = {
  concept: {
    label: "Concept Focus",
    color: "var(--mode-concept)",
    icon: BookOpen,
    bgClass: "bg-mode-concept/10",
  },
  application: {
    label: "Application Focus",
    color: "var(--mode-application)",
    icon: Lightbulb,
    bgClass: "bg-mode-application/10",
  },
  analysis: {
    label: "Analysis Focus",
    color: "var(--mode-analysis)",
    icon: Brain,
    bgClass: "bg-mode-analysis/10",
  },
  review: {
    label: "Failure Review",
    color: "var(--mode-review)",
    icon: MessageSquare,
    bgClass: "bg-mode-review/10",
  },
  revision: {
    label: "Light Revision",
    color: "var(--mode-revision)",
    icon: CheckCircle2,
    bgClass: "bg-mode-revision/10",
  },
};

const taskTypeIcon: Record<DailyTask["type"], React.ElementType> = {
  "micro-concept": BookOpen,
  practical: Lightbulb,
  variation: Brain,
  reflection: MessageSquare,
};

export const DailyPlanCard = ({
  mode,
  skill,
  tasks,
  onTaskComplete,
  onStartSession,
}: DailyPlanCardProps) => {
  const config = modeConfig[mode];
  const ModeIcon = config.icon;
  const [localTasks, setLocalTasks] = useState(tasks);

  const completedCount = localTasks.filter((t) => t.completed).length;
  const totalDuration = localTasks.reduce((acc, t) => acc + t.duration, 0);
  const progress = (completedCount / localTasks.length) * 100;

  const handleTaskToggle = (taskId: string) => {
    setLocalTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    );
    onTaskComplete?.(taskId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border/50 shadow-card overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 pb-4 border-b border-border/30">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl ${config.bgClass} flex items-center justify-center`}
            >
              <ModeIcon
                className="w-6 h-6"
                style={{ color: `hsl(${config.color})` }}
              />
            </div>
            <div>
              <span
                className="text-xs font-medium px-2 py-1 rounded-full"
                style={{
                  backgroundColor: `hsl(${config.color} / 0.1)`,
                  color: `hsl(${config.color})`,
                }}
              >
                {config.label}
              </span>
              <h3 className="text-lg font-semibold text-foreground mt-1">
                {skill}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{totalDuration} min</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {completedCount}/{localTasks.length} tasks completed
            </span>
            <span className="font-medium text-foreground">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full rounded-full gradient-primary"
            />
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="p-4 space-y-3">
        {localTasks.map((task, index) => {
          const TaskIcon = taskTypeIcon[task.type];
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleTaskToggle(task.id)}
              className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                task.completed
                  ? "bg-success/10 border border-success/20"
                  : "bg-muted/30 hover:bg-muted/50"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                  task.completed
                    ? "bg-success text-success-foreground"
                    : "bg-muted"
                }`}
              >
                {task.completed ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <TaskIcon className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium ${
                      task.completed
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {task.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {task.duration} min
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 pt-0">
        <Button
          variant="hero"
          className="w-full"
          onClick={onStartSession}
          disabled={completedCount === localTasks.length}
        >
          {completedCount === localTasks.length ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Session Complete!
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Start Session
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};
