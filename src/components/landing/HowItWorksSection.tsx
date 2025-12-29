import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Calendar, CheckCircle2, Target } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Target,
    title: "Define Your Goal",
    description:
      "Tell us what you want to achieve—learn Python, get fit, master photography, or any other goal across any domain.",
  },
  {
    number: "02",
    icon: BookOpen,
    title: "We Build Your Path",
    description:
      "Our engine decomposes your goal into skills, sub-goals, and creates a personalized daily learning experience plan.",
  },
  {
    number: "03",
    icon: Calendar,
    title: "Learn Daily",
    description:
      "Engage with varied daily sessions: micro-concepts, practical tasks, quizzes, reflections—all designed to prevent boredom.",
  },
  {
    number: "04",
    icon: CheckCircle2,
    title: "Grow Consistently",
    description:
      "Track your progress, maintain streaks, and watch as small daily efforts compound into major skill development.",
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-primary text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Your Journey to{" "}
            <span className="bg-gradient-to-r from-primary to-sky-400 bg-clip-text text-transparent">
              Mastery
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Four simple steps to transform any goal into sustainable daily
            learning habits.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-border to-transparent z-0">
                  <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-border" />
                </div>
              )}

              <div className="relative z-10 text-center lg:text-left">
                {/* Number badge */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary text-primary-foreground font-bold text-xl mb-6 shadow-medium">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto lg:mx-0 mb-4">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
