import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { goalTitle, category } = await req.json();

    if (!goalTitle) {
      throw new Error("Goal title is required");
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a career advisor and learning path designer. Your job is to identify SPECIFIC LEARNING TOPICS that someone needs to master.

CRITICAL RULES:
- Break down skills into LEARNABLE TOPICS, not just skill names
- For "Python": suggest "Python Variables & Data Types", "Python Lists & Dictionaries", "Python Loops & Conditions", "Python Functions", "Python File Handling", "Python OOP"
- For "Machine Learning": suggest "Linear Regression", "Decision Trees", "Neural Networks", "Pandas for Data Analysis", "Scikit-learn Basics", "TensorFlow Fundamentals"
- Each topic should be something you can learn in 1-2 weeks
- Topics should build on each other logically (fundamentals first, advanced later)

Focus on:
1. Foundational concepts that must be learned first
2. Intermediate topics that build on fundamentals
3. Advanced/specialized topics for job readiness

Respond with a JSON object containing an array of skills, each with:
- name: SPECIFIC learning topic (e.g., "Python Lists & Dictionaries", "SQL JOINs & Subqueries", "React Hooks")
- importance: "critical" (learn first) | "important" (learn next) | "nice-to-have" (advanced)
- futureProof: boolean (true if this topic will remain relevant in 5+ years)
- reason: brief explanation (1 sentence) of what you'll be able to do after learning this

Return exactly 8-12 topics in logical learning order. Only return valid JSON, no markdown or explanation.`
          },
          {
            role: "user",
            content: `Goal: "${goalTitle}"${category ? ` (Category: ${category})` : ""}

Break this goal into SPECIFIC LEARNABLE TOPICS in logical order. Start with fundamentals (variables, basics) and progress to advanced topics. Each topic should be concrete enough to find a tutorial or course for it.`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI Gateway error: ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response (handle potential markdown wrapping)
    let skills;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        skills = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError, "Content:", content);
      // Fallback skills if AI response is malformed
      skills = {
        skills: [
          { name: "Python Variables & Data Types", importance: "critical", futureProof: true, reason: "Foundation for all Python programming" },
          { name: "Python Lists & Dictionaries", importance: "critical", futureProof: true, reason: "Essential data structures for any Python project" },
          { name: "Python Loops & Conditions", importance: "critical", futureProof: true, reason: "Control flow for building logic" },
          { name: "Python Functions", importance: "important", futureProof: true, reason: "Write reusable, organized code" },
          { name: "Python File Handling", importance: "important", futureProof: true, reason: "Read/write data from files" },
        ]
      };
    }

    return new Response(JSON.stringify(skills), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
