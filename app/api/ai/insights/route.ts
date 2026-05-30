import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildPainPointsPrompt } from "@/lib/ai/prompts";
import { getLast90DaysRange } from "@/lib/utils/dates";

export const runtime = "nodejs";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { type } = await request.json() as { type: "pain_points" | "suggestions" };

  // Check cache (valid for 7 days)
  const { data: cached } = await supabase
    .from("ai_insights")
    .select("*")
    .eq("user_id", user.id)
    .eq("type", type)
    .gt("expires_at", new Date().toISOString())
    .order("generated_at", { ascending: false })
    .limit(1)
    .single();

  if (cached) {
    return Response.json(cached.content);
  }

  // Fetch fresh data
  const { start, end } = getLast90DaysRange();
  const [profileResult, txResult, categoriesResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", start)
      .lte("date", end),
    supabase.from("categories").select("id, name").eq("user_id", user.id),
  ]);

  const profile = profileResult.data;
  const transactions = txResult.data ?? [];
  const categoriesMap: Record<string, string> = {};
  (categoriesResult.data ?? []).forEach((c) => { categoriesMap[c.id] = c.name; });

  const prompt = buildPainPointsPrompt(profile!, transactions, categoriesMap);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const content = JSON.parse((response.content[0] as { text: string }).text);
  const tokenCount = response.usage.input_tokens + response.usage.output_tokens;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await supabase.from("ai_insights").insert({
    user_id: user.id,
    type,
    content,
    expires_at: expiresAt.toISOString(),
    token_count: tokenCount,
  });

  return Response.json(content);
}
