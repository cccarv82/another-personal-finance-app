import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { getMonthRange } from "@/lib/utils/dates";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { start, end } = getMonthRange();

  const [profileResult, txResult, goalsResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user!.id)
      .gte("date", start)
      .lte("date", end),
    supabase.from("financial_goals").select("*").eq("user_id", user!.id),
  ]);

  const transactions = txResult.data ?? [];
  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const goals = goalsResult.data ?? [];
  const goalProgress =
    goals.length > 0
      ? goals.reduce((s, g) => s + g.current_amount / (g.target_amount || 1), 0) / goals.length
      : 0;

  return (
    <DashboardClient
      profile={profileResult.data}
      income={income}
      expense={expense}
      savings={income - expense}
      goalProgress={goalProgress}
    />
  );
}
