import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (skillName: string) => void;
  goalTitle: string;
}

const suggestedSkills: Record<string, string[]> = {
  "Data Science": ["Python", "SQL", "Statistics", "Machine Learning", "Data Visualization", "Pandas"],
  "Web Development": ["JavaScript", "React", "CSS", "Node.js", "TypeScript", "APIs"],
  "Cloud Computing": ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "Linux"],
  "Machine Learning": ["TensorFlow", "PyTorch", "Neural Networks", "NLP", "Computer Vision", "Deep Learning"],
  "Cybersecurity": ["Network Security", "Penetration Testing", "Cryptography", "OWASP", "Incident Response"],
  "Project Management": ["Agile", "Scrum", "Jira", "Stakeholder Management", "Risk Management"],
  default: ["Communication", "Problem Solving", "Critical Thinking", "Time Management", "Collaboration"],
};

export const AddSkillModal = ({
  isOpen,
  onClose,
  onSubmit,
  goalTitle,
}: AddSkillModalProps) => {
  const [skillName, setSkillName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (skillName.trim()) {
      onSubmit(skillName.trim());
      setSkillName("");
    }
  };

  const handleSuggestionClick = (skill: string) => {
    onSubmit(skill);
  };

  // Get relevant suggestions based on goal title
  const getSuggestions = () => {
    for (const [category, skills] of Object.entries(suggestedSkills)) {
      if (goalTitle.toLowerCase().includes(category.toLowerCase())) {
        return skills;
      }
    }
    return suggestedSkills.default;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-2xl shadow-xl z-50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Add Skill to Track
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  For: {goalTitle}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="skillName">Skill Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="skillName"
                    placeholder="e.g., Python, React, AWS..."
                    value={skillName}
                    onChange={(e) => setSkillName(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!skillName.trim()}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Suggestions */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lightbulb className="w-4 h-4" />
                  <span>Suggested skills</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getSuggestions().map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-colors"
                      onClick={() => handleSuggestionClick(skill)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
