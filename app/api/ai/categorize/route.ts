import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildCategorizationPrompt } from "@/lib/ai/prompts";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({}, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { descriptions } = await request.json() as { descriptions: string[] };
  if (!descriptions?.length) return Response.json({});

  const anthropic = new Anthropic();

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: buildCategorizationPrompt(descriptions) }],
    });

    let rawText = (response.content[0] as { text: string }).text.trim();
    if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    }

    return Response.json(JSON.parse(rawText));
  } catch (err) {
    console.error("[ai/categorize]", err);
    return Response.json({});
  }
}
