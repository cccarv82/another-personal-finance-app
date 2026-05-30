import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildMonthlyReportPrompt } from "@/lib/ai/prompts";
import { getCurrentPeriod, getMonthRange } from "@/lib/utils/dates";

export const runtime = "nodejs";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { period = getCurrentPeriod() } = await request.json() as { period?: string };

  // Check cache
  const { data: cached } = await supabase
    .from("ai_insights")
    .select("*")
    .eq("user_id", user.id)
    .eq("type", "monthly_report")
    .eq("period", period)
    .single();

  if (cached) return Response.json(cached.content);

  const { start, end } = getMonthRange(period);
  const [year, month] = period.split("-").map(Number);
  const prevPeriod = month === 1 ? `${year - 1}-12` : `${year}-${String(month - 1).padStart(2, "0")}`;
  const { start: prevStart, end: prevEnd } = getMonthRange(prevPeriod);

  const [profileResult, currentTxResult, prevTxResult, categoriesResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("transactions").select("*, categories(name)").eq("user_id", user.id).gte("date", start).lte("date", end),
    supabase.from("transactions").select("*").eq("user_id", user.id).gte("date", prevStart).lte("date", prevEnd),
    supabase.from("categories").select("id, name").eq("user_id", user.id),
  ]);

  const profile = profileResult.data!;
  const currentTx = currentTxResult.data ?? [];
  const prevTx = prevTxResult.data ?? [];

  const sumType = (txs: typeof currentTx, type: string) =>
    txs.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);

  const income = sumType(currentTx, "income");
  const expense = sumType(currentTx, "expense");
  const prevIncome = sumType(prevTx, "income");
  const prevExpense = sumType(prevTx, "expense");

  // Top categories
  const categoryTotals: Record<string, number> = {};
  currentTx
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const name = (t as { categories?: { name: string } | null }).categories?.name ?? "Sem categoria";
      categoryTotals[name] = (categoryTotals[name] || 0) + t.amount;
    });
  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, amount]) => ({ name, amount }));

  const savingsGoal = (profile.monthly_income ?? income) * 0.2;

  const prompt = buildMonthlyReportPrompt(
    profile,
    { income, expense, savings: income - expense, period },
    prevTx.length > 0 ? { income: prevIncome, expense: prevExpense, savings: prevIncome - prevExpense } : null,
    topCategories,
    savingsGoal
  );

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const content = JSON.parse((response.content[0] as { text: string }).text);
  const tokenCount = response.usage.input_tokens + response.usage.output_tokens;

  await supabase.from("ai_insights").insert({
    user_id: user.id,
    type: "monthly_report",
    period,
    content,
    token_count: tokenCount,
  });

  return Response.json(content);
}
