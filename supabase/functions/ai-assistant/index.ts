import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AIRequest {
  type: 'suggest_update' | 'generate_weekly' | 'analyze_opportunity';
  content: string;
  clientType?: string;
  context?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, content, clientType, context } = await req.json() as AIRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case 'suggest_update':
        systemPrompt = `You are an AI assistant for an Amazon agency. Analyze employee work updates and:
1. Suggest if this could be a growth opportunity for the client
2. Provide a refined version of the update that's client-friendly
3. Flag if feedback from the client might be needed

Keep responses concise and actionable. Format as JSON:
{
  "isGrowthOpportunity": boolean,
  "opportunityReason": "string or null",
  "refinedUpdate": "string",
  "feedbackNeeded": boolean,
  "feedbackReason": "string or null"
}`;
        userPrompt = `Client type: ${clientType || 'general'}
Work update: ${content}
${context ? `Additional context: ${JSON.stringify(context)}` : ''}`;
        break;

      case 'generate_weekly':
        systemPrompt = `You are an AI assistant creating weekly summaries for Amazon agency clients. Generate a professional, engaging summary that:
1. Highlights key accomplishments
2. Notes any growth opportunities identified
3. Outlines next week's focus areas

Keep the tone professional but friendly. Format as JSON:
{
  "summary": "string",
  "highlights": ["string array of 3-5 key points"],
  "growthOpportunities": ["string array"],
  "nextWeekFocus": ["string array of 2-3 items"]
}`;
        userPrompt = `Client type: ${clientType || 'general'}
Daily updates this week:
${content}`;
        break;

      case 'analyze_opportunity':
        systemPrompt = `You are an AI assistant for an Amazon agency analyzing potential growth opportunities. Provide:
1. Assessment of the opportunity's potential
2. Recommended next steps
3. Estimated impact

Format as JSON:
{
  "assessment": "string",
  "potential": "high" | "medium" | "low",
  "nextSteps": ["string array"],
  "estimatedImpact": "string"
}`;
        userPrompt = `Client type: ${clientType || 'general'}
Opportunity: ${content}`;
        break;

      default:
        throw new Error(`Unknown request type: ${type}`);
    }

    console.log(`Processing AI request: ${type}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response from AI
    let parsedResponse;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/) || 
                        aiResponse.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiResponse;
      parsedResponse = JSON.parse(jsonStr);
    } catch {
      console.log("Raw AI response:", aiResponse);
      parsedResponse = { rawResponse: aiResponse };
    }

    console.log(`AI request ${type} completed successfully`);

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("AI assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
