import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Flame, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ConfidenceDataPoint {
  date: string;
  score: number;
  skillName: string;
}

interface StreakDataPoint {
  date: string;
  streak: number;
}

interface TimeInvestedDataPoint {
  skill: string;
  minutes: number;
  days: number;
}

interface ProgressChartsProps {
  confidenceData: ConfidenceDataPoint[];
  streakData: StreakDataPoint[];
  timeInvestedData: TimeInvestedDataPoint[];
}

const COLORS = [
  "hsl(217, 91%, 40%)",
  "hsl(199, 89%, 48%)",
  "hsl(262, 83%, 58%)",
  "hsl(38, 92%, 55%)",
  "hsl(172, 66%, 50%)",
];

export const ProgressCharts = ({
  confidenceData,
  streakData,
  timeInvestedData,
}: ProgressChartsProps) => {
  // Aggregate confidence by date (average across skills)
  const aggregatedConfidence = confidenceData.reduce((acc, curr) => {
    const existing = acc.find(d => d.date === curr.date);
    if (existing) {
      existing.scores.push(curr.score);
      existing.score = existing.scores.reduce((a, b) => a + b, 0) / existing.scores.length;
    } else {
      acc.push({ date: curr.date, score: curr.score, scores: [curr.score] });
    }
    return acc;
  }, [] as { date: string; score: number; scores: number[] }[]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const totalMinutes = timeInvestedData.reduce((acc, curr) => acc + curr.minutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border/50 shadow-card p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
          <TrendingUp className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Progress Analytics</h3>
          <p className="text-sm text-muted-foreground">Track your learning journey</p>
        </div>
      </div>

      <Tabs defaultValue="confidence" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="confidence" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Confidence</span>
          </TabsTrigger>
          <TabsTrigger value="streak" className="flex items-center gap-2">
            <Flame className="w-4 h-4" />
            <span className="hidden sm:inline">Streak</span>
          </TabsTrigger>
          <TabsTrigger value="time" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Time</span>
          </TabsTrigger>
        </TabsList>

        {/* Confidence Curve */}
        <TabsContent value="confidence" className="mt-0">
          {aggregatedConfidence.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={aggregatedConfidence}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
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
                    labelFormatter={formatDate}
                    formatter={(value: number) => [value.toFixed(1), "Confidence"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(217, 91%, 40%)"
                    strokeWidth={3}
                    dot={{ fill: "hsl(217, 91%, 40%)", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>Complete practice sessions to see your confidence curve</p>
            </div>
          )}
        </TabsContent>

        {/* Streak Graph */}
        <TabsContent value="streak" className="mt-0">
          {streakData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={streakData.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelFormatter={formatDate}
                    formatter={(value: number) => [value, "Day Streak"]}
                  />
                  <Bar 
                    dataKey="streak" 
                    fill="hsl(38, 92%, 55%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>Start practicing to build your streak</p>
            </div>
          )}
        </TabsContent>

        {/* Time Invested */}
        <TabsContent value="time" className="mt-0">
          {timeInvestedData.length > 0 ? (
            <div className="h-64 flex items-center gap-8">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={timeInvestedData}
                      dataKey="minutes"
                      nameKey="skill"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {timeInvestedData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`${Math.floor(value / 60)}h ${value % 60}m`, "Time"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                <div className="text-center mb-4">
                  <p className="text-3xl font-bold text-foreground">{totalHours}h</p>
                  <p className="text-sm text-muted-foreground">Total invested</p>
                </div>
                {timeInvestedData.slice(0, 4).map((item, index) => (
                  <div key={item.skill} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-foreground truncate flex-1">{item.skill}</span>
                    <span className="text-sm text-muted-foreground">{item.days}d</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>Log practice to track time invested</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
