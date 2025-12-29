import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ExternalLink, BookOpen, Video, FileText, GraduationCap, Star, Clock, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  url: string;
  type: string;
  skill_category: string;
  cost: string;
  provider: string | null;
  duration_minutes: number | null;
  difficulty: string | null;
  rating: number | null;
  is_featured: boolean | null;
}

const typeIcons: Record<string, React.ReactNode> = {
  course: <GraduationCap className="w-4 h-4" />,
  article: <FileText className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  tutorial: <BookOpen className="w-4 h-4" />,
  book: <BookOpen className="w-4 h-4" />,
};

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-600 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-600 border-red-500/20",
};

export const ResourceLibrary = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("is_featured", { ascending: false })
      .order("rating", { ascending: false });

    if (error) {
      console.error("Error fetching resources:", error);
    } else if (data) {
      setResources(data);
      const uniqueCategories = [...new Set(data.map((r) => r.skill_category))];
      setCategories(uniqueCategories);
    }
    setLoading(false);
  };

  const filteredResources =
    selectedCategory === "all"
      ? resources
      : resources.filter((r) => r.skill_category === selectedCategory);

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="bg-card rounded-2xl border border-border/50 shadow-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border/50 shadow-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Free Learning Resources
            </h3>
            <p className="text-sm text-muted-foreground">
              Curated materials to bridge your skill gaps
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Filter className="w-3 h-3" />
          {filteredResources.length} resources
        </Badge>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("all")}
          className="whitespace-nowrap"
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="whitespace-nowrap"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Resources List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {filteredResources.map((resource, index) => (
          <motion.a
            key={resource.id}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="block p-4 rounded-xl bg-muted/50 border border-border/30 hover:border-primary/30 hover:bg-muted transition-all duration-200 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                {typeIcons[resource.type] || <BookOpen className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {resource.title}
                      </h4>
                      {resource.is_featured && (
                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                      {resource.description}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </div>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {resource.provider && (
                    <span className="text-xs text-muted-foreground">
                      {resource.provider}
                    </span>
                  )}
                  {resource.rating && (
                    <span className="flex items-center gap-1 text-xs text-amber-600">
                      <Star className="w-3 h-3 fill-amber-500" />
                      {resource.rating}
                    </span>
                  )}
                  {resource.duration_minutes && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatDuration(resource.duration_minutes)}
                    </span>
                  )}
                  {resource.difficulty && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${difficultyColors[resource.difficulty]}`}
                    >
                      {resource.difficulty}
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className="text-xs bg-green-500/10 text-green-600 border-green-500/20"
                  >
                    {resource.cost === "free" ? "Free" : resource.cost}
                  </Badge>
                </div>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
};
