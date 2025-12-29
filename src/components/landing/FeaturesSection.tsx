import { motion } from "framer-motion";
import {
  Brain,
  Flame,
  Heart,
  Lightbulb,
  RefreshCw,
  Shield,
  Target,
  Wallet,
} from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Goal-Based Learning",
    description:
      "Define any goal—technical, creative, fitness, academic—and we'll create a personalized learning path.",
    color: "mode-concept",
  },
  {
    icon: Brain,
    title: "Skill Decomposition",
    description:
      "Goals break down into sub-goals, skills, and daily learning experiences automatically.",
    color: "mode-application",
  },
  {
    icon: RefreshCw,
    title: "Anti-Boredom Variety",
    description:
      "Rotates between concepts, applications, analysis, reviews, and revisions to keep you engaged.",
    color: "mode-analysis",
  },
  {
    icon: Lightbulb,
    title: "Learning Autonomy",
    description:
      "Progressive hints, no direct solutions, and reflection-gated progression build independence.",
    color: "mode-review",
  },
  {
    icon: Flame,
    title: "Consistency Protection",
    description:
      "Engagement drop detection, adaptive difficulty, and streak preservation keep you on track.",
    color: "mode-revision",
  },
  {
    icon: Heart,
    title: "Personal Rhythm",
    description:
      "Adjusts daily workload based on your time, energy, and past engagement patterns.",
    color: "mode-concept",
  },
  {
    icon: Wallet,
    title: "Free-First Resources",
    description:
      "Always prioritizes free resources, with optional low-cost and paid alternatives.",
    color: "mode-application",
  },
  {
    icon: Shield,
    title: "Local-First Privacy",
    description:
      "Runs on your local setup with FastAPI and MySQL—no cloud dependency required.",
    color: "mode-analysis",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-primary text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              Learn Better
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            ALSIP focuses on how you learn, not just what you learn. Our
            behavior-centric approach prevents burnout and builds lasting
            habits.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative p-6 rounded-2xl bg-card border border-border/50 shadow-card hover:shadow-medium transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-${feature.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                style={{
                  backgroundColor: `hsl(var(--${feature.color}) / 0.1)`,
                }}
              >
                <feature.icon
                  className="w-6 h-6"
                  style={{ color: `hsl(var(--${feature.color}))` }}
                />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
