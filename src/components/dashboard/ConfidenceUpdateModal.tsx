import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ConfidenceUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillId: string;
  skillName: string;
  currentConfidence: number | null;
  onComplete: () => void;
}

export const ConfidenceUpdateModal = ({
  isOpen,
  onClose,
  skillId,
  skillName,
  currentConfidence,
  onComplete,
}: ConfidenceUpdateModalProps) => {
  const [confidence, setConfidence] = useState<number>(currentConfidence || 5);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const { error } = await supabase
        .from("skills")
        .update({
          confidence_score: confidence,
          last_confidence_update: today,
        })
        .eq("id", skillId);

      if (error) throw error;

      toast.success("Confidence updated!");
      onComplete();
      onClose();
    } catch (error) {
      console.error("Error updating confidence:", error);
      toast.error("Failed to update confidence");
    } finally {
      setSaving(false);
    }
  };

  const getConfidenceLabel = (score: number) => {
    if (score <= 2) return "Just starting";
    if (score <= 4) return "Getting familiar";
    if (score <= 6) return "Building momentum";
    if (score <= 8) return "Feeling confident";
    return "Ready to apply!";
  };

  const getConfidenceColor = (score: number) => {
    if (score <= 3) return "from-red-500 to-orange-500";
    if (score <= 6) return "from-amber-500 to-yellow-500";
    return "from-green-500 to-emerald-500";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-sm overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Weekly Check-in</h2>
                <p className="text-sm text-muted-foreground">{skillName}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              How confident do you feel about this skill?
            </p>
            <div className={`text-5xl font-bold bg-gradient-to-r ${getConfidenceColor(confidence)} bg-clip-text text-transparent`}>
              {confidence}/10
            </div>
            <p className="text-sm text-foreground mt-2 font-medium">
              {getConfidenceLabel(confidence)}
            </p>
          </div>

          {/* Slider */}
          <div className="space-y-2">
            <input
              type="range"
              min="1"
              max="10"
              value={confidence}
              onChange={(e) => setConfidence(parseInt(e.target.value))}
              className="w-full h-3 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Not confident</span>
              <span>Very confident</span>
            </div>
          </div>

          {currentConfidence && (
            <div className="text-center text-sm text-muted-foreground">
              Previous: {currentConfidence}/10
              {confidence > currentConfidence && (
                <span className="text-green-600 ml-2">↑ Growing!</span>
              )}
              {confidence < currentConfidence && (
                <span className="text-amber-600 ml-2">↓ That&apos;s okay, keep going</span>
              )}
            </div>
          )}

          <Button
            variant="hero"
            className="w-full"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Saving..." : "Update Confidence"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
