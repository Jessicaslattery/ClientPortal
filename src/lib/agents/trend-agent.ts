import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";

const SYSTEM_PROMPT = `You are the Pivot Co. Trend Agent. Research current social media trends and return actionable intelligence.

Search for what is currently working on Instagram, LinkedIn and TikTok for business coaches, consultants and founders.

Return VALID JSON ONLY: no preamble, no markdown:

{
  "weekOf": "string",
  "instagram": {
    "topFormat": "string",
    "topHookStyle": "string",
    "whatToAvoid": "string",
    "trendToTest": "string",
    "pivotAngle": "string: how Pivot Co. clients can use this"
  },
  "linkedin": {
    "topFormat": "string",
    "topHookStyle": "string",
    "whatToAvoid": "string",
    "trendToTest": "string",
    "pivotAngle": "string"
  },
  "tiktok": {
    "topFormat": "string",
    "topHookStyle": "string",
    "whatToAvoid": "string",
    "trendToTest": "string",
    "pivotAngle": "string"
  },
  "topInsightThisWeek": "string",
  "contentAgentFeed": ["string array: top 5 trends to feed into content planning"]
}

Be specific and actionable. No generic advice. Only things actually moving on platforms right now. Australian English.`;

export async function generateTrendDigest(): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set.");
  }

  const now = new Date();
  const weekOf = now.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    tools: [{ type: "web_search_20250305", name: "web_search" }],
    messages: [
      {
        role: "user",
        content: `Research and generate this week's social media trend digest. Week of: ${weekOf}. Search for what is actually performing right now on Instagram, LinkedIn, and TikTok for business coaches, consultants, and founders in 2025.`,
      },
    ],
  });

  // Extract the final text block (after any tool use)
  const textBlock = msg.content.findLast((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Trend Agent returned no text response");
  }

  // Validate JSON
  let parsed: {
    weekOf: string;
    instagram: Record<string, string>;
    linkedin: Record<string, string>;
    tiktok: Record<string, string>;
    topInsightThisWeek: string;
    contentAgentFeed: string[];
  };
  try {
    const raw = textBlock.text.trim();
    // Strip markdown code fences (```json ... ``` or ``` ... ```)
    let jsonStr: string;
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      jsonStr = fenceMatch[1].trim();
    } else {
      // Fallback: grab everything from first { to last }
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      jsonStr = start !== -1 && end !== -1 ? raw.slice(start, end + 1) : raw;
    }
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error(`Trend Agent returned invalid JSON: ${textBlock.text.slice(0, 300)}`);
  }

  const jsonContent = JSON.stringify(parsed);

  // Save founder-level output (no clientProfileId)
  await prisma.agentOutput.create({
    data: {
      type: "trend_digest",
      content: jsonContent,
      clientProfileId: null,
    },
  });

  // Publish to Tier 2 (CORE) and Tier 3 (OPERATOR) client dashboards
  const tier2and3Clients = await prisma.clientProfile.findMany({
    where: { tier: { in: ["CORE", "OPERATOR"] } },
    select: { id: true },
  });

  if (tier2and3Clients.length > 0) {
    await prisma.agentOutput.createMany({
      data: tier2and3Clients.map((c) => ({
        type: "trend_digest",
        content: jsonContent,
        clientProfileId: c.id,
      })),
    });
  }

  return jsonContent;
}
