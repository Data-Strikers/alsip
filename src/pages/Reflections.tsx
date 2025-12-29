import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { reflectionService, skillService, analyticsService } from "@/services/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { 
  MessageSquare, TrendingUp, Calendar, Download, 
  Filter, Loader2, ChevronDown, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Reflection {
  id: string;
  skill_id: string;
  clarity_gain: number;
  confusion_note: string | null;
  difficulty_feeling: string | null;
  created_at: string;
}

interface Skill {
  id: string;
  name: string;
}

interface ConfidenceTrend {
  date: string;
  score: number;
  skillName: string;
}

const difficultyLabels: Record<string, { label: string; emoji: string; color: string }> = {
  too_easy: { label: "Too Easy", emoji: "😎", color: "hsl(172, 66%, 50%)" },
  just_right: { label: "Just Right", emoji: "👌", color: "hsl(142, 70%, 45%)" },
  too_hard: { label: "Too Hard", emoji: "😓", color: "hsl(38, 92%, 55%)" },
};

const clarityLabels: Record<number, string> = {
  1: "Still confused",
  2: "A bit clearer",
  3: "Understanding",
  4: "Getting confident",
  5: "Mastered!",
};

export default function Reflections() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [confidenceData, setConfidenceData] = useState<ConfidenceTrend[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
    if (user) {
      fetchData();
    }
  }, [user, loading, navigate]);

  const fetchData = async () => {
    if (!user) return;
    setDataLoading(true);

    try {
      const [reflectionsData, skillsData, confidence] = await Promise.all([
        reflectionService.getReflections(user.id),
        skillService.getSkillsByUser(user.id),
        analyticsService.getConfidenceHistory(user.id),
      ]);

      setReflections(reflectionsData);
      setSkills(skillsData);
      setConfidenceData(confidence);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load reflections");
    } finally {
      setDataLoading(false);
    }
  };

  const getSkillName = (skillId: string) => {
    return skills.find(s => s.id === skillId)?.name || "Unknown Skill";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const filteredReflections = selectedSkill
    ? reflections.filter(r => r.skill_id === selectedSkill)
    : reflections;

  const handleExportPDF = () => {
    // Create printable content
    const content = filteredReflections.map(r => ({
      date: formatDate(r.created_at),
      skill: getSkillName(r.skill_id),
      clarity: clarityLabels[r.clarity_gain] || `Level ${r.clarity_gain}`,
      difficulty: r.difficulty_feeling ? difficultyLabels[r.difficulty_feeling]?.label : "N/A",
      notes: r.confusion_note || "No notes",
    }));

    // Create a simple printable format
    const printContent = `
      ALSIP Learning Reflections
      Exported: ${new Date().toLocaleDateString()}
      
      ${content.map(r => `
      ${r.date} - ${r.skill}
      Clarity: ${r.clarity}
      Difficulty: ${r.difficulty}
      Notes: ${r.notes}
      ---
      `).join("\n")}
    `;

    // Open print dialog
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>ALSIP Reflections</title>
            <style>
              body { font-family: system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
              h1 { color: #1e40af; }
              .reflection { margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e5e7eb; }
              .date { color: #6b7280; font-size: 14px; }
              .skill { font-weight: 600; font-size: 18px; margin: 8px 0; }
              .meta { display: flex; gap: 16px; margin: 8px 0; color: #6b7280; }
              .notes { background: #f3f4f6; padding: 12px; border-radius: 8px; margin-top: 8px; }
            </style>
          </head>
          <body>
            <h1>ALSIP Learning Reflections</h1>
            <p style="color: #6b7280;">Exported: ${new Date().toLocaleDateString()}</p>
            ${content.map(r => `
              <div class="reflection">
                <div class="date">${r.date}</div>
                <div class="skill">${r.skill}</div>
                <div class="meta">
                  <span>Clarity: ${r.clarity}</span>
                  <span>Difficulty: ${r.difficulty}</span>
                </div>
                ${r.notes !== "No notes" ? `<div class="notes">${r.notes}</div>` : ""}
              </div>
            `).join("")}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }

    toast.success("PDF export ready!");
  };

  // Aggregate confidence data for chart
  const chartData = confidenceData.reduce((acc, curr) => {
    const existing = acc.find(d => d.date === curr.date);
    if (existing) {
      existing.score = (existing.score + curr.score) / 2;
    } else {
      acc.push({ date: curr.date, score: curr.score });
    }
    return acc;
  }, [] as { date: string; score: number }[]);

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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                Reflection History
              </h1>
              <p className="text-muted-foreground">
                Track your learning journey and confidence growth
              </p>
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    {selectedSkill ? getSkillName(selectedSkill) : "All Skills"}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedSkill(null)}>
                    All Skills
                  </DropdownMenuItem>
                  {skills.map(skill => (
                    <DropdownMenuItem 
                      key={skill.id}
                      onClick={() => setSelectedSkill(skill.id)}
                    >
                      {skill.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" onClick={handleExportPDF}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Confidence Trend Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 bg-card rounded-2xl border border-border/50 shadow-card p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Confidence Trend</h3>
                  <p className="text-sm text-muted-foreground">Your growth over time</p>
                </div>
              </div>

              {chartData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis
                        domain={[0, 10]}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [value.toFixed(1), "Confidence"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="hsl(217, 91%, 40%)"
                        strokeWidth={3}
                        dot={{ fill: "hsl(217, 91%, 40%)", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Complete sessions to see your confidence trend</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Stats Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="bg-card rounded-xl border border-border/50 shadow-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Total Reflections</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{reflections.length}</p>
              </div>

              <div className="bg-card rounded-xl border border-border/50 shadow-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-success" />
                  <span className="text-sm text-muted-foreground">Avg Clarity Gain</span>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {reflections.length > 0
                    ? (reflections.reduce((acc, r) => acc + r.clarity_gain, 0) / reflections.length).toFixed(1)
                    : "0"}/5
                </p>
              </div>

              <div className="bg-card rounded-xl border border-border/50 shadow-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-secondary" />
                  <span className="text-sm text-muted-foreground">Skills Tracked</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{skills.length}</p>
              </div>
            </motion.div>
          </div>

          {/* Reflection List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Recent Reflections
            </h2>

            {filteredReflections.length === 0 ? (
              <div className="bg-card rounded-xl border border-border/50 shadow-card p-8 text-center">
                <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No reflections yet</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate("/daily-plan")}
                >
                  Start a Session
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReflections.map((reflection, index) => (
                  <motion.div
                    key={reflection.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-xl border border-border/50 shadow-card p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(reflection.created_at)}
                        </p>
                        <h4 className="font-medium text-foreground">
                          {getSkillName(reflection.skill_id)}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          Clarity: {reflection.clarity_gain}/5
                        </span>
                        {reflection.difficulty_feeling && difficultyLabels[reflection.difficulty_feeling] && (
                          <span 
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: `${difficultyLabels[reflection.difficulty_feeling].color}20`,
                              color: difficultyLabels[reflection.difficulty_feeling].color 
                            }}
                          >
                            {difficultyLabels[reflection.difficulty_feeling].emoji}{" "}
                            {difficultyLabels[reflection.difficulty_feeling].label}
                          </span>
                        )}
                      </div>
                    </div>
                    {reflection.confusion_note && (
                      <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                        {reflection.confusion_note}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
