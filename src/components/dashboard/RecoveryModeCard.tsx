import { motion } from "framer-motion";
import { Heart, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecoveryModeCardProps {
  missedDays: number;
  onStartRecovery: () => void;
}

const recoveryMessages = [
  "Life happens. Let's ease back in.",
  "A gentle restart is still progress.",
  "Small steps today, momentum tomorrow.",
  "You're back — that's what matters.",
];

export const RecoveryModeCard = ({ missedDays, onStartRecovery }: RecoveryModeCardProps) => {
  const message = recoveryMessages[Math.min(missedDays - 1, recoveryMessages.length - 1)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-amber-500/10 via-card to-orange-500/5 rounded-2xl border border-amber-500/20 shadow-card p-6"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
          <Heart className="w-6 h-6 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Recovery Mode
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            {message}
          </p>

          <div className="bg-muted/50 rounded-xl p-4 mb-4">
            <p className="text-sm text-foreground font-medium mb-2">
              Today&apos;s gentle plan:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-500" />
                5-min quick review of recent topics
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                1 reflection to reconnect
              </li>
            </ul>
          </div>

          <Button variant="hero" onClick={onStartRecovery} className="w-full">
            <Heart className="w-4 h-4 mr-2" />
            Start Recovery Day
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        Complete today to rebuild your streak. No pressure.
      </p>
    </motion.div>
  );
};
