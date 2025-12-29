import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { profileService, goalService } from "@/services/api";
import { Target, Clock, Lightbulb, ChevronRight, ChevronLeft, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface OnboardingData {
  displayName: string;
  primaryGoal: string;
  category: string;
  timePerDay: string;
  learningStyle: string;
}

const categories = [
  { id: "tech", label: "Technology", icon: "💻" },
  { id: "business", label: "Business", icon: "📊" },
  { id: "creative", label: "Creative", icon: "🎨" },
  { id: "language", label: "Languages", icon: "🌍" },
  { id: "personal", label: "Personal Development", icon: "🧠" },
  { id: "other", label: "Other", icon: "✨" },
];

const timeOptions = [
  { id: "15min", label: "15 minutes", description: "Quick daily practice" },
  { id: "30min", label: "30 minutes", description: "Balanced approach" },
  { id: "1hour", label: "1 hour", description: "Deep focus sessions" },
  { id: "2hours", label: "2+ hours", description: "Intensive learning" },
];

const learningStyles = [
  { id: "discipline", label: "Disciplined", description: "Structured daily routines, consistent schedule", icon: "📅" },
  { id: "light", label: "Light Touch", description: "Flexible timing, shorter sessions", icon: "🌿" },
  { id: "flexible", label: "Flexible", description: "Learn when inspired, variable pace", icon: "🌊" },
];

export default function Onboarding() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    displayName: "",
    primaryGoal: "",
    category: "",
    timePerDay: "",
    learningStyle: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
    if (user) {
      setData(prev => ({
        ...prev,
        displayName: user.user_metadata?.display_name || user.email?.split("@")[0] || "",
      }));
    }
  }, [user, loading, navigate]);

  const totalSteps = 4;

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.displayName.trim().length >= 2;
      case 2:
        return data.primaryGoal.trim().length >= 3 && data.category !== "";
      case 3:
        return data.timePerDay !== "";
      case 4:
        return data.learningStyle !== "";
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      // Update profile with onboarding data
      await profileService.completeOnboarding(user.id, {
        display_name: data.displayName,
        learning_style: data.learningStyle,
        current_goal: data.primaryGoal,
      });

      // Create the first goal
      const daysMap: Record<string, number> = {
        "15min": 90,
        "30min": 60,
        "1hour": 45,
        "2hours": 30,
      };

      await goalService.createGoal(user.id, {
        title: data.primaryGoal,
        category: data.category,
        timeline: "3months",
        effort_level: data.timePerDay,
        days_remaining: daysMap[data.timePerDay] || 60,
      });

      toast.success("Welcome to ALSIP!", {
        description: "Your learning journey begins now.",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
        <motion.div
          className="h-full gradient-primary"
          initial={{ width: "0%" }}
          animate={{ width: `${(step / totalSteps) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-lg">
          {/* Step Counter */}
          <div className="text-center mb-8">
            <span className="text-sm text-muted-foreground">
              Step {step} of {totalSteps}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Name */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                    Welcome to ALSIP
                  </h1>
                  <p className="text-muted-foreground">
                    Let's personalize your learning experience
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    What should we call you?
                  </label>
                  <Input
                    placeholder="Enter your name"
                    value={data.displayName}
                    onChange={(e) => setData({ ...data, displayName: e.target.value })}
                    className="text-lg py-6"
                    autoFocus
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Goal */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
                    <Target className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                    What do you want to learn?
                  </h1>
                  <p className="text-muted-foreground">
                    Define your primary learning goal
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Your goal
                    </label>
                    <Input
                      placeholder="e.g., Master React development"
                      value={data.primaryGoal}
                      onChange={(e) => setData({ ...data, primaryGoal: e.target.value })}
                      className="text-lg py-6"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Category
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setData({ ...data, category: cat.id })}
                          className={`p-4 rounded-xl border text-center transition-all ${
                            data.category === cat.id
                              ? "border-primary bg-primary/10 shadow-soft"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          <span className="text-2xl mb-2 block">{cat.icon}</span>
                          <span className="text-sm font-medium text-foreground">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Time */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl gradient-warm flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                    How much time per day?
                  </h1>
                  <p className="text-muted-foreground">
                    We'll tailor your daily plan accordingly
                  </p>
                </div>

                <div className="space-y-3">
                  {timeOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setData({ ...data, timePerDay: option.id })}
                      className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                        data.timePerDay === option.id
                          ? "border-primary bg-primary/10 shadow-soft"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <div>
                        <p className="font-medium text-foreground">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      {data.timePerDay === option.id && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: Learning Style */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
                    <Lightbulb className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                    Your learning style
                  </h1>
                  <p className="text-muted-foreground">
                    How do you prefer to approach learning?
                  </p>
                </div>

                <div className="space-y-3">
                  {learningStyles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setData({ ...data, learningStyle: style.id })}
                      className={`w-full p-5 rounded-xl border text-left transition-all ${
                        data.learningStyle === style.id
                          ? "border-primary bg-primary/10 shadow-soft"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-2xl">{style.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{style.label}</p>
                          <p className="text-sm text-muted-foreground">{style.description}</p>
                        </div>
                        {data.learningStyle === style.id && (
                          <Check className="w-5 h-5 text-primary mt-1" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1}
              className={step === 1 ? "invisible" : ""}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              variant="hero"
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Setting up...
                </span>
              ) : step === totalSteps ? (
                <>
                  Start Learning
                  <Sparkles className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
