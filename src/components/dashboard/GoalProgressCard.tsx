import { motion } from "framer-motion";
import { ChevronRight, Target, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Skill {
  name: string;
  progress: number;
  color: string;
}

interface GoalProgressCardProps {
  goalName: string;
  overallProgress: number;
  skills: Skill[];
  daysRemaining: number;
  onAddSkill?: () => void;
}

export const GoalProgressCard = ({
  goalName,
  overallProgress,
  skills,
  daysRemaining,
  onAddSkill,
}: GoalProgressCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-2xl border border-border/50 shadow-card p-6"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
            <Target className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{goalName}</h3>
            <p className="text-sm text-muted-foreground">
              {daysRemaining} days remaining
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Overall progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Overall Progress</span>
          <span className="font-semibold text-foreground">{overallProgress}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full gradient-primary"
          />
        </div>
      </div>

      {/* Skills breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-foreground">Skills Breakdown</h4>
          {onAddSkill && (
            <Button variant="ghost" size="sm" onClick={onAddSkill} className="h-7 px-2">
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          )}
        </div>
        {skills.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">No skills tracked yet</p>
            {onAddSkill && (
              <Button variant="outline" size="sm" onClick={onAddSkill}>
                <Plus className="w-4 h-4 mr-1" />
                Add Skill
              </Button>
            )}
          </div>
        ) : (
          skills.map((skill, index) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">{skill.name}</span>
                <span className="font-medium text-foreground">{skill.progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.progress}%` }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: `hsl(${skill.color})` }}
                />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};
