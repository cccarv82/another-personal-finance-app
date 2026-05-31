import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildPainPointsPrompt } from "@/lib/ai/prompts";
import { getLast90DaysRange } from "@/lib/utils/dates";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "ANTHROPIC_API_KEY não configurada" }, { status: 503 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { type, force } = await request.json() as { type: "pain_points" | "suggestions"; force?: boolean };

  // Check cache (valid for 7 days) unless force-refresh requested
  if (!force) {
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

  if (!profile) {
    return Response.json({ error: "Perfil não encontrado" }, { status: 404 });
  }

  const prompt = buildPainPointsPrompt(profile, transactions, categoriesMap);

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    let rawText = (response.content[0] as { text: string }).text.trim();
    // Strip markdown code fences if model wraps response
    if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    }
    const content = JSON.parse(rawText);
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
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[ai/insights]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
