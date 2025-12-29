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
            content: `You are a career advisor and skill gap analyst. Your job is to identify SPECIFIC, CONCRETE skills needed for career goals.

CRITICAL RULES:
- Give EXACT skill names like "Python", "AWS Lambda", "React.js", "SQL", "Kubernetes", "Figma", "Power BI", "TensorFlow"
- NEVER use vague terms like "Core Fundamentals", "Problem Solving", "Communication", "Technical Skills"
- Every skill must be something you can search for on LinkedIn Jobs or Udemy
- Include specific tools, frameworks, languages, and certifications

Focus on:
1. Specific technical tools and languages required for the role
2. Specific platforms and frameworks employers are hiring for
3. Industry-specific certifications that boost job security

Respond with a JSON object containing an array of skills, each with:
- name: SPECIFIC skill/tool name (e.g., "Python", "AWS", "Tableau", "Docker")
- importance: "critical" | "important" | "nice-to-have"
- futureProof: boolean (true if this skill will remain relevant in 5+ years)
- reason: brief explanation (1 sentence) mentioning job market demand or salary impact

Return exactly 6-8 skills. Only return valid JSON, no markdown or explanation.`
          },
          {
            role: "user",
            content: `Goal: "${goalTitle}"${category ? ` (Category: ${category})` : ""}

List the SPECIFIC tools, technologies, frameworks, and certifications someone needs to achieve this goal. Be concrete - name exact technologies like "Python", "AWS", "Salesforce", not vague categories.`
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
          { name: "Python", importance: "critical", futureProof: true, reason: "Most in-demand programming language across industries" },
          { name: "SQL", importance: "critical", futureProof: true, reason: "Essential for data management in 90% of companies" },
          { name: "Git", importance: "important", futureProof: true, reason: "Version control is required in every tech job" },
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
