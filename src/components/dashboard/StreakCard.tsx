import { motion } from "framer-motion";
import { Flame, TrendingUp } from "lucide-react";

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  weekData: { day: string; completed: boolean }[];
}

export const StreakCard = ({
  currentStreak,
  longestStreak,
  weekData,
}: StreakCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-card rounded-2xl border border-border/50 shadow-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Your Streak</h3>
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <TrendingUp className="w-4 h-4" />
          Best: {longestStreak} days
        </div>
      </div>

      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="w-24 h-24 rounded-full gradient-warm flex items-center justify-center shadow-medium"
          >
            <div className="w-20 h-20 rounded-full bg-card flex items-center justify-center">
              <div className="text-center">
                <Flame className="w-6 h-6 text-secondary mx-auto mb-1" />
                <span className="text-2xl font-bold text-foreground">
                  {currentStreak}
                </span>
              </div>
            </div>
          </motion.div>
          {currentStreak > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-success flex items-center justify-center"
            >
              <span className="text-xs font-bold text-success-foreground">
                🔥
              </span>
            </motion.div>
          )}
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground mb-6">
        {currentStreak === 0
          ? "Start today to build your streak!"
          : currentStreak === 1
          ? "Great start! Keep it going tomorrow."
          : `${currentStreak} days in a row! Amazing consistency.`}
      </p>

      {/* Week view */}
      <div className="grid grid-cols-7 gap-2">
        {weekData.map((day, index) => (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="flex flex-col items-center gap-1"
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                day.completed
                  ? "gradient-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {day.completed ? (
                <Flame className="w-4 h-4" />
              ) : (
                <span className="text-xs">{index + 1}</span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground">{day.day}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
