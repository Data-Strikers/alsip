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
            content: `You are a career advisor and skill gap analyst. Your job is to identify the essential skills needed for career goals, focusing on:
1. Core technical skills required for the role
2. Emerging skills that will be important in the next 2-5 years
3. Soft skills that differentiate top performers

Always prioritize skills that:
- Are in high demand in the job market
- Help professionals stay relevant and avoid layoffs
- Can be learned through free or low-cost resources

Respond with a JSON object containing an array of skills, each with:
- name: skill name (concise, 2-4 words max)
- importance: "critical" | "important" | "nice-to-have"
- futureProof: boolean (true if this skill will remain relevant in 5+ years)
- reason: brief explanation (1 sentence) of why this skill matters

Return exactly 6-8 skills. Only return valid JSON, no markdown or explanation.`
          },
          {
            role: "user",
            content: `Goal: "${goalTitle}"${category ? ` (Category: ${category})` : ""}

What skills does someone need to master to achieve this goal and remain competitive in the job market? Focus on skills that protect against layoffs and increase job security.`
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
          { name: "Core Fundamentals", importance: "critical", futureProof: true, reason: "Foundation for all advanced learning" },
          { name: "Problem Solving", importance: "critical", futureProof: true, reason: "Essential for any technical role" },
          { name: "Communication", importance: "important", futureProof: true, reason: "Differentiates top performers" },
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
