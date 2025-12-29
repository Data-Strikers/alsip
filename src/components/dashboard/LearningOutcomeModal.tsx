import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Lightbulb, HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LearningOutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillId: string;
  skillName: string;
  userId: string;
  onComplete: () => void;
}

const clarityOptions = [
  { value: 1, label: "Still confused", emoji: "😵" },
  { value: 2, label: "Slightly clearer", emoji: "🤔" },
  { value: 3, label: "Getting it", emoji: "😊" },
  { value: 4, label: "Much clearer", emoji: "😄" },
  { value: 5, label: "Totally clear!", emoji: "🎯" },
];

const difficultyOptions = [
  { value: "too_easy", label: "Too easy", color: "bg-green-500/10 text-green-600 border-green-500/30" },
  { value: "just_right", label: "Just right", color: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
  { value: "too_hard", label: "Too hard", color: "bg-red-500/10 text-red-600 border-red-500/30" },
];

export const LearningOutcomeModal = ({
  isOpen,
  onClose,
  skillId,
  skillName,
  userId,
  onComplete,
}: LearningOutcomeModalProps) => {
  const [clarityGain, setClarityGain] = useState<number | null>(null);
  const [confusionNote, setConfusionNote] = useState("");
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!clarityGain || !difficulty) {
      toast.error("Please answer both questions");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("learning_outcomes").insert({
        user_id: userId,
        skill_id: skillId,
        clarity_gain: clarityGain,
        confusion_note: confusionNote || null,
        difficulty_feeling: difficulty,
      });

      if (error) throw error;

      toast.success("Reflection saved! Great learning today.");
      onComplete();
      onClose();
    } catch (error) {
      console.error("Error saving outcome:", error);
      toast.error("Failed to save reflection");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Quick Reflection</h2>
                <p className="text-sm text-muted-foreground">{skillName}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Clarity Question */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-foreground">
                What clicked today?
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {clarityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setClarityGain(option.value)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    clarityGain === option.value
                      ? "bg-primary text-primary-foreground shadow-md scale-105"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  <span className="mr-1">{option.emoji}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Confusion Note */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-foreground">
                What still feels unclear? <span className="text-muted-foreground">(optional)</span>
              </span>
            </div>
            <Textarea
              value={confusionNote}
              onChange={(e) => setConfusionNote(e.target.value)}
              placeholder="Anything you want to revisit..."
              className="resize-none h-20"
            />
          </div>

          {/* Difficulty Question */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-foreground">
                How did today feel?
              </span>
            </div>
            <div className="flex gap-2">
              {difficultyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDifficulty(option.value)}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                    difficulty === option.value
                      ? option.color + " border-2 scale-105"
                      : "bg-muted/50 border-border/50 text-foreground hover:bg-muted"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <Button
            variant="hero"
            className="w-full"
            onClick={handleSubmit}
            disabled={saving || !clarityGain || !difficulty}
          >
            {saving ? "Saving..." : "Complete Reflection"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
