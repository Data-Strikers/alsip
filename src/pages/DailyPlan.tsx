import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { skillService, reflectionService, streakService } from "@/services/api";
import { 
  BookOpen, Lightbulb, Layers, MessageSquare, 
  CheckCircle2, Circle, ArrowRight, Flame,
  ChevronLeft, ChevronRight, Sparkles, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface DailyExperience {
  id: string;
  type: "concept" | "task" | "variation" | "reflection";
  title: string;
  description: string;
  completed: boolean;
  duration: number;
}

interface Skill {
  id: string;
  name: string;
  days_practiced: number | null;
  last_practiced_date: string | null;
}

const experienceIcons = {
  concept: BookOpen,
  task: Lightbulb,
  variation: Layers,
  reflection: MessageSquare,
};

const experienceColors = {
  concept: "hsl(217, 91%, 40%)",
  task: "hsl(199, 89%, 48%)",
  variation: "hsl(262, 83%, 58%)",
  reflection: "hsl(38, 92%, 55%)",
};

export default function DailyPlan() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [experiences, setExperiences] = useState<DailyExperience[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [reflectionText, setReflectionText] = useState("");
  const [difficultyFeedback, setDifficultyFeedback] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
    if (user) {
      fetchSkills();
    }
  }, [user, loading, navigate]);

  const fetchSkills = async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const userSkills = await skillService.getSkillsByUser(user.id);
      setSkills(userSkills);
      if (userSkills.length > 0) {
        selectSkill(userSkills[0]);
      }
    } catch (error) {
      console.error("Error fetching skills:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const selectSkill = (skill: Skill) => {
    setSelectedSkill(skill);
    // Generate daily experiences for this skill
    const generated: DailyExperience[] = [
      {
        id: "1",
        type: "concept",
        title: "Learn the Core Concept",
        description: `Spend 10 minutes reviewing key principles of ${skill.name}. Focus on understanding rather than memorizing.`,
        completed: false,
        duration: 10,
      },
      {
        id: "2",
        type: "task",
        title: "Apply What You Learned",
        description: `Practice ${skill.name} with a hands-on exercise. Try to solve a small problem or build something simple.`,
        completed: false,
        duration: 15,
      },
      {
        id: "3",
        type: "variation",
        title: "Explore a Variation",
        description: `Look at ${skill.name} from a different angle. Watch a video, read an article, or try an alternative approach.`,
        completed: false,
        duration: 10,
      },
      {
        id: "4",
        type: "reflection",
        title: "Reflect & Consolidate",
        description: "Write down what you learned today. What clicked? What's still confusing?",
        completed: false,
        duration: 5,
      },
    ];
    setExperiences(generated);
    setCurrentStep(0);
    setReflectionText("");
    setDifficultyFeedback(null);
  };

  const handleCompleteStep = () => {
    const updated = [...experiences];
    updated[currentStep].completed = true;
    setExperiences(updated);

    if (currentStep < experiences.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFinishSession = async () => {
    if (!user || !selectedSkill) return;

    setIsCompleting(true);

    try {
      // Log practice for the skill
      await skillService.logPractice(selectedSkill.id, selectedSkill.days_practiced || 0);

      // Save reflection
      const clarityGain = difficultyFeedback === "too_easy" ? 5 : 
                          difficultyFeedback === "just_right" ? 4 : 3;
      
      await reflectionService.createReflection(
        user.id,
        selectedSkill.id,
        clarityGain,
        reflectionText || undefined,
        difficultyFeedback || undefined
      );

      // Update streak
      const streak = await streakService.getStreak(user.id);
      if (streak) {
        const today = new Date().toISOString().split("T")[0];
        const lastActivity = streak.last_activity_date;
        
        let newStreak = (streak.current_streak || 0) + 1;
        if (lastActivity === today) {
          newStreak = streak.current_streak || 1;
        }
        
        await streakService.updateStreak(user.id, {
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, streak.longest_streak || 0),
          last_activity_date: today,
          is_in_recovery: false,
          missed_days: 0,
        });
      }

      toast.success("Session complete! 🎉", {
        description: `You've practiced ${selectedSkill.name} for another day.`,
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error completing session:", error);
      toast.error("Failed to save progress. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  const currentExperience = experiences[currentStep];
  const progress = experiences.filter(e => e.completed).length;
  const totalDuration = experiences.reduce((acc, e) => acc + e.duration, 0);

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (skills.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">No Skills Yet</h1>
            <p className="text-muted-foreground mb-8">
              Add skills to your goals first, then come back for your daily practice.
            </p>
            <Button variant="hero" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Skill Selector */}
          <div className="mb-8">
            <p className="text-sm text-muted-foreground mb-3">Today's Focus</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {skills.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => selectSkill(skill)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    selectedSkill?.id === skill.id
                      ? "gradient-primary text-primary-foreground shadow-soft"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {skill.name}
                </button>
              ))}
            </div>
          </div>

          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border/50 shadow-card p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Daily Session</h2>
                <p className="text-sm text-muted-foreground">
                  {progress}/{experiences.length} completed • ~{totalDuration} min total
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10">
                <Flame className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-foreground">
                  {selectedSkill?.days_practiced || 0} day streak
                </span>
              </div>
            </div>

            {/* Step Progress */}
            <div className="flex gap-2">
              {experiences.map((exp, idx) => {
                const Icon = experienceIcons[exp.type];
                return (
                  <button
                    key={exp.id}
                    onClick={() => setCurrentStep(idx)}
                    className={`flex-1 p-3 rounded-xl border transition-all ${
                      idx === currentStep
                        ? "border-primary bg-primary/10"
                        : exp.completed
                        ? "border-success/50 bg-success/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      {exp.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : (
                        <Icon 
                          className="w-5 h-5" 
                          style={{ color: experienceColors[exp.type] }}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Current Experience */}
          <AnimatePresence mode="wait">
            {currentExperience && (
              <motion.div
                key={currentExperience.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-card rounded-2xl border border-border/50 shadow-card p-8"
              >
                {(() => {
                  const Icon = experienceIcons[currentExperience.type];
                  return (
                    <>
                      <div className="flex items-center gap-3 mb-6">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${experienceColors[currentExperience.type]}20` }}
                        >
                          <Icon 
                            className="w-6 h-6"
                            style={{ color: experienceColors[currentExperience.type] }}
                          />
                        </div>
                        <div>
                          <span 
                            className="text-xs font-medium uppercase tracking-wider"
                            style={{ color: experienceColors[currentExperience.type] }}
                          >
                            {currentExperience.type}
                          </span>
                          <h3 className="text-xl font-semibold text-foreground">
                            {currentExperience.title}
                          </h3>
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {currentExperience.description}
                      </p>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                        <Circle className="w-4 h-4" />
                        <span>~{currentExperience.duration} minutes</span>
                      </div>

                      {/* Reflection Step Extra UI */}
                      {currentExperience.type === "reflection" && (
                        <div className="space-y-6 mb-8">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                              What did you learn today?
                            </label>
                            <Textarea
                              placeholder="Write your thoughts..."
                              value={reflectionText}
                              onChange={(e) => setReflectionText(e.target.value)}
                              rows={4}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                              How did it feel?
                            </label>
                            <div className="flex gap-3">
                              {[
                                { id: "too_easy", label: "Too Easy", emoji: "😎" },
                                { id: "just_right", label: "Just Right", emoji: "👌" },
                                { id: "too_hard", label: "Too Hard", emoji: "😓" },
                              ].map((option) => (
                                <button
                                  key={option.id}
                                  onClick={() => setDifficultyFeedback(option.id)}
                                  className={`flex-1 p-4 rounded-xl border text-center transition-all ${
                                    difficultyFeedback === option.id
                                      ? "border-primary bg-primary/10"
                                      : "border-border hover:border-primary/50"
                                  }`}
                                >
                                  <span className="text-2xl block mb-1">{option.emoji}</span>
                                  <span className="text-sm text-foreground">{option.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Navigation */}
                      <div className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                          disabled={currentStep === 0}
                        >
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          Previous
                        </Button>

                        {currentStep === experiences.length - 1 ? (
                          <Button
                            variant="hero"
                            onClick={handleFinishSession}
                            disabled={isCompleting}
                          >
                            {isCompleting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                Complete Session
                                <CheckCircle2 className="w-4 h-4 ml-2" />
                              </>
                            )}
                          </Button>
                        ) : currentExperience.completed ? (
                          <Button
                            variant="outline"
                            onClick={() => setCurrentStep(currentStep + 1)}
                          >
                            Next Step
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        ) : (
                          <Button variant="hero" onClick={handleCompleteStep}>
                            Mark Complete
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
