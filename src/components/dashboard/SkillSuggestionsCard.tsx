import { motion } from "framer-motion";
import { useState } from "react";
import { Sparkles, Plus, Check, Loader2, Shield, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SuggestedSkill {
  name: string;
  importance: "critical" | "important" | "nice-to-have";
  futureProof: boolean;
  reason: string;
}

interface SkillSuggestionsCardProps {
  goalId: string;
  goalTitle: string;
  category: string;
  existingSkills: string[];
  onSkillAdded: () => void;
  userId: string;
}

const importanceColors: Record<string, string> = {
  critical: "bg-red-500/10 text-red-600 border-red-500/20",
  important: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "nice-to-have": "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

export const SkillSuggestionsCard = ({
  goalId,
  goalTitle,
  category,
  existingSkills,
  onSkillAdded,
  userId,
}: SkillSuggestionsCardProps) => {
  const [suggestions, setSuggestions] = useState<SuggestedSkill[]>([]);
  const [loading, setLoading] = useState(false);
  const [addedSkills, setAddedSkills] = useState<Set<string>>(new Set());
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("suggest-skills", {
        body: { goalTitle, category },
      });

      if (error) throw error;

      const skillsArray = data.skills || data;
      if (Array.isArray(skillsArray)) {
        // Filter out skills that already exist
        const filteredSkills = skillsArray.filter(
          (s: SuggestedSkill) => !existingSkills.some(
            (existing) => existing.toLowerCase() === s.name.toLowerCase()
          )
        );
        setSuggestions(filteredSkills);
        setHasGenerated(true);
      }
    } catch (error) {
      console.error("Error generating suggestions:", error);
      toast.error("Failed to generate skill suggestions");
    } finally {
      setLoading(false);
    }
  };

  const addSkill = async (skill: SuggestedSkill) => {
    try {
      const { error } = await supabase.from("skills").insert({
        user_id: userId,
        goal_id: goalId,
        name: skill.name,
        progress: 0,
      });

      if (error) throw error;

      setAddedSkills((prev) => new Set([...prev, skill.name]));
      toast.success(`"${skill.name}" added to your skills`);
      onSkillAdded();
    } catch (error) {
      console.error("Error adding skill:", error);
      toast.error("Failed to add skill");
    }
  };

  const addAllSkills = async () => {
    const skillsToAdd = suggestions.filter((s) => !addedSkills.has(s.name));
    for (const skill of skillsToAdd) {
      await addSkill(skill);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border/50 shadow-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-primary/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">AI Skill Analysis</h3>
            <p className="text-xs text-muted-foreground">
              Skills needed for career security
            </p>
          </div>
        </div>
      </div>

      {!hasGenerated ? (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground mb-4">
            Let AI analyze your goal and suggest essential skills to stay competitive and avoid layoffs.
          </p>
          <Button
            variant="hero"
            onClick={generateSuggestions}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Skill Recommendations
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {suggestions.length} skills recommended
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={addAllSkills}
                disabled={suggestions.every((s) => addedSkills.has(s.name))}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add All
              </Button>
            </div>
          )}

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {suggestions.map((skill, index) => {
              const isAdded = addedSkills.has(skill.name);
              return (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 rounded-xl border transition-all ${
                    isAdded
                      ? "bg-primary/5 border-primary/20"
                      : "bg-muted/50 border-border/30 hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-medium text-foreground text-sm">
                          {skill.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${importanceColors[skill.importance]}`}
                        >
                          {skill.importance}
                        </Badge>
                        {skill.futureProof && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-green-500/10 text-green-600 border-green-500/20 gap-0.5"
                          >
                            <Shield className="w-3 h-3" />
                            Future-proof
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {skill.reason}
                      </p>
                    </div>
                    <Button
                      variant={isAdded ? "ghost" : "outline"}
                      size="sm"
                      className="shrink-0 h-8"
                      onClick={() => addSkill(skill)}
                      disabled={isAdded}
                    >
                      {isAdded ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {suggestions.length === 0 && (
            <div className="text-center py-4">
              <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                All suggested skills have already been added.
              </p>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={generateSuggestions}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-1" />
                Refresh Suggestions
              </>
            )}
          </Button>
        </div>
      )}
    </motion.div>
  );
};
