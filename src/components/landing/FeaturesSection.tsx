import { motion } from "framer-motion";
import {
  AlertTriangle,
  Brain,
  Flame,
  Lightbulb,
  RefreshCw,
  Shield,
  Target,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: AlertTriangle,
    title: "Skill Gap Detection",
    description:
      "Identify the critical skills you're missing that employers demand. Know exactly where you stand before it's too late.",
    color: "mode-review",
  },
  {
    icon: TrendingUp,
    title: "Future-Proof Intelligence",
    description:
      "Stay ahead of industry shifts. We track emerging skills and warn you about obsolete ones before they hurt your career.",
    color: "mode-concept",
  },
  {
    icon: Target,
    title: "Personalized Learning Paths",
    description:
      "Turn any career goal into a structured daily plan. From where you are to where you need to be.",
    color: "mode-application",
  },
  {
    icon: Brain,
    title: "Smart Skill Mapping",
    description:
      "We break down complex skills into achievable daily learning experiences. No overwhelm, just progress.",
    color: "mode-analysis",
  },
  {
    icon: RefreshCw,
    title: "Anti-Boredom System",
    description:
      "Varied learning modes prevent burnout: concepts, hands-on practice, analysis, and reflection keep you engaged.",
    color: "mode-revision",
  },
  {
    icon: Flame,
    title: "Consistency Engine",
    description:
      "Streak tracking, adaptive difficulty, and engagement detection ensure you never fall behind.",
    color: "mode-concept",
  },
  {
    icon: Lightbulb,
    title: "Learn to Learn",
    description:
      "Build independence with progressive hints and reflection-based growth. No spoon-feeding.",
    color: "mode-application",
  },
  {
    icon: Shield,
    title: "Free-First Resources",
    description:
      "Always prioritizes free learning materials. Budget-aware recommendations that respect your wallet.",
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
            Why ALSIP
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Stay Relevant.{" "}
            <span className="bg-gradient-to-r from-primary to-sky-400 bg-clip-text text-transparent">
              Stay Employed.
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            The job market doesn't wait. ALSIP helps you identify skill gaps, 
            learn what matters, and build the expertise that keeps you 
            indispensable—before layoffs happen.
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
