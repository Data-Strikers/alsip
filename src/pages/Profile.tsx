import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User,
  Target,
  TrendingUp,
  Flame,
  BookOpen,
  ArrowLeft,
  Edit2,
  Check,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ProfileData {
  display_name: string | null;
  learning_style: string | null;
  resource_preference: string | null;
  strongest_skills: string[];
}

interface GoalData {
  id: string;
  title: string;
  category: string;
  is_active: boolean;
}

interface StreakData {
  current_streak: number;
  longest_streak: number;
}

const learningStyleLabels: Record<string, { label: string; color: string; description: string }> = {
  consistent: {
    label: "Consistent Learner",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    description: "You practice regularly with steady progress",
  },
  burst: {
    label: "Burst Learner",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    description: "You learn in focused, intensive sessions",
  },
  recovery: {
    label: "Recovery Learner",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    description: "You bounce back from breaks with determination",
  },
};

const resourcePrefLabels: Record<string, string> = {
  free: "Free resources only",
  low_cost: "Free + low-cost",
  any: "Any resource type",
};

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const [profileRes, goalsRes, streakRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("goals").select("id, title, category, is_active").eq("user_id", user.id),
        supabase.from("streaks").select("current_streak, longest_streak").eq("user_id", user.id).single(),
      ]);

      if (profileRes.data) {
        setProfile({
          display_name: profileRes.data.display_name,
          learning_style: profileRes.data.learning_style,
          resource_preference: profileRes.data.resource_preference,
          strongest_skills: profileRes.data.strongest_skills || [],
        });
        setNewName(profileRes.data.display_name || "");
      }

      if (goalsRes.data) setGoals(goalsRes.data);
      if (streakRes.data) setStreak(streakRes.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateDisplayName = async () => {
    if (!user || !newName.trim()) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: newName.trim() })
        .eq("user_id", user.id);

      if (error) throw error;

      setProfile((prev) => prev ? { ...prev, display_name: newName.trim() } : null);
      setEditingName(false);
      toast.success("Name updated!");
    } catch (error) {
      console.error("Error updating name:", error);
      toast.error("Failed to update name");
    }
  };

  const updateResourcePreference = async (pref: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ resource_preference: pref })
        .eq("user_id", user.id);

      if (error) throw error;

      setProfile((prev) => prev ? { ...prev, resource_preference: pref } : null);
      toast.success("Preference updated!");
    } catch (error) {
      console.error("Error updating preference:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  const activeGoals = goals.filter((g) => g.is_active);
  const style = profile?.learning_style ? learningStyleLabels[profile.learning_style] : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border/50 shadow-card p-6 mb-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-2xl font-bold">
              {(profile?.display_name || user?.email || "U")[0].toUpperCase()}
            </div>
            <div className="flex-1">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="max-w-xs"
                    autoFocus
                  />
                  <Button size="sm" onClick={updateDisplayName}>
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground">
                    {profile?.display_name || "Learner"}
                  </h1>
                  <button
                    onClick={() => setEditingName(true)}
                    className="p-1 hover:bg-muted rounded"
                  >
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              )}
              <p className="text-muted-foreground text-sm">{user?.email}</p>

              {style && (
                <Badge className={`mt-2 ${style.color}`}>
                  {style.label}
                </Badge>
              )}
            </div>
          </div>

          {style && (
            <p className="text-sm text-muted-foreground mt-4 pl-20">
              {style.description}
            </p>
          )}
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border/50 p-4 text-center"
          >
            <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {streak?.current_streak || 0}
            </div>
            <p className="text-xs text-muted-foreground">Current Streak</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card rounded-xl border border-border/50 p-4 text-center"
          >
            <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {streak?.longest_streak || 0}
            </div>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border/50 p-4 text-center"
          >
            <Target className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {activeGoals.length}
            </div>
            <p className="text-xs text-muted-foreground">Active Goals</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card rounded-xl border border-border/50 p-4 text-center"
          >
            <BookOpen className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {goals.length}
            </div>
            <p className="text-xs text-muted-foreground">Total Goals</p>
          </motion.div>
        </div>

        {/* Active Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl border border-border/50 shadow-card p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Active Goals
          </h2>
          {activeGoals.length > 0 ? (
            <div className="space-y-3">
              {activeGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                >
                  <span className="font-medium text-foreground">{goal.title}</span>
                  <Badge variant="secondary">{goal.category}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No active goals yet.</p>
          )}
        </motion.div>

        {/* Strongest Skills */}
        {profile?.strongest_skills && profile.strongest_skills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-card rounded-2xl border border-border/50 shadow-card p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Strongest Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.strongest_skills.map((skill) => (
                <Badge key={skill} className="bg-green-500/10 text-green-600 border-green-500/20">
                  {skill}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}

        {/* Resource Preference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl border border-border/50 shadow-card p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            Resource Preference
          </h2>
          <div className="flex flex-wrap gap-2">
            {["free", "low_cost", "any"].map((pref) => (
              <button
                key={pref}
                onClick={() => updateResourcePreference(pref)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  profile?.resource_preference === pref
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80 text-foreground"
                }`}
              >
                {resourcePrefLabels[pref]}
              </button>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
