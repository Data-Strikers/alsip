import { motion, AnimatePresence } from "framer-motion";
import { X, Target, Clock, Wallet, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goal: {
    title: string;
    category: string;
    timeline: string;
    effort: string;
  }) => void;
}

const categories = [
  { id: "technical", label: "Technical", emoji: "💻" },
  { id: "creative", label: "Creative", emoji: "🎨" },
  { id: "fitness", label: "Fitness", emoji: "💪" },
  { id: "academic", label: "Academic", emoji: "📚" },
  { id: "professional", label: "Professional", emoji: "💼" },
  { id: "personal", label: "Personal", emoji: "🌱" },
];

const timelines = [
  { id: "1month", label: "1 Month", description: "Quick skill boost" },
  { id: "3months", label: "3 Months", description: "Solid foundation" },
  { id: "6months", label: "6 Months", description: "Deep expertise" },
  { id: "1year", label: "1 Year", description: "Mastery level" },
];

const efforts = [
  { id: "light", label: "Light", description: "15-30 min/day" },
  { id: "moderate", label: "Moderate", description: "30-60 min/day" },
  { id: "intensive", label: "Intensive", description: "1-2 hours/day" },
];

export const CreateGoalModal = ({
  isOpen,
  onClose,
  onSubmit,
}: CreateGoalModalProps) => {
  const [step, setStep] = useState(1);
  const [goalTitle, setGoalTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTimeline, setSelectedTimeline] = useState("");
  const [selectedEffort, setSelectedEffort] = useState("");

  const handleSubmit = () => {
    onSubmit({
      title: goalTitle,
      category: selectedCategory,
      timeline: selectedTimeline,
      effort: selectedEffort,
    });
    // Reset form
    setStep(1);
    setGoalTitle("");
    setSelectedCategory("");
    setSelectedTimeline("");
    setSelectedEffort("");
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return goalTitle.trim().length > 0;
      case 2:
        return selectedCategory !== "";
      case 3:
        return selectedTimeline !== "";
      case 4:
        return selectedEffort !== "";
      default:
        return false;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-auto sm:w-full sm:max-w-lg max-h-[90vh] bg-card rounded-2xl shadow-medium border border-border/50 z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Create New Goal
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Step {step} of 4
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(step / 4) * 100}%` }}
                className="h-full gradient-primary"
              />
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-medium text-foreground">
                      What do you want to learn?
                    </h3>
                    <input
                      type="text"
                      value={goalTitle}
                      onChange={(e) => setGoalTitle(e.target.value)}
                      placeholder="e.g., Learn Python programming, Master photography..."
                      className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <p className="text-sm text-muted-foreground">
                      Be specific about what you want to achieve. We'll help you
                      break it down.
                    </p>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-medium text-foreground">
                      Choose a category
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                            selectedCategory === cat.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <span className="text-2xl mb-2 block">{cat.emoji}</span>
                          <span className="font-medium text-foreground">
                            {cat.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-medium text-foreground">
                        Set your timeline
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {timelines.map((tl) => (
                        <button
                          key={tl.id}
                          onClick={() => setSelectedTimeline(tl.id)}
                          className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left flex items-center justify-between ${
                            selectedTimeline === tl.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div>
                            <span className="font-medium text-foreground block">
                              {tl.label}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {tl.description}
                            </span>
                          </div>
                          {selectedTimeline === tl.id && (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <ChevronRight className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-medium text-foreground">
                        Daily effort level
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {efforts.map((ef) => (
                        <button
                          key={ef.id}
                          onClick={() => setSelectedEffort(ef.id)}
                          className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left flex items-center justify-between ${
                            selectedEffort === ef.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div>
                            <span className="font-medium text-foreground block">
                              {ef.label}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {ef.description}
                            </span>
                          </div>
                          {selectedEffort === ef.id && (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <ChevronRight className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-border/30">
              <Button
                variant="ghost"
                onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
              >
                {step > 1 ? "Back" : "Cancel"}
              </Button>
              <Button
                variant="hero"
                onClick={() => (step < 4 ? setStep(step + 1) : handleSubmit())}
                disabled={!canProceed()}
              >
                {step < 4 ? (
                  <>
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Create Learning Path
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
