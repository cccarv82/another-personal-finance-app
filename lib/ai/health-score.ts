import type { Transaction } from "@/lib/supabase/types";
import { getMonthRange } from "@/lib/utils/dates";

export interface HealthScoreBreakdown {
  total: number;
  savingsRate: { score: number; value: number; weight: number };
  spendingControl: { score: number; value: number; weight: number };
  diversification: { score: number; value: number; weight: number };
  goalProgress: { score: number; value: number; weight: number };
  incomeStability: { score: number; value: number; weight: number };
  label: "crítico" | "alerta" | "regular" | "bom" | "excelente";
  color: string;
}

export function calculateHealthScore(
  transactions: Transaction[],
  monthlyIncome: number,
  goalProgress: number // 0–1
): HealthScoreBreakdown {
  const { start, end } = getMonthRange();
  const currentMonth = transactions.filter((t) => t.date >= start && t.date <= end);

  const income = currentMonth
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const expense = currentMonth
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const baseIncome = income > 0 ? income : monthlyIncome || 1;

  // 1. Savings rate (30%)
  const savingsRateValue = Math.max(0, (baseIncome - expense) / baseIncome);
  const savingsScore = Math.min(100, savingsRateValue * 250); // 40% savings = 100

  // 2. Spending control (25%) — variance across last 3 months
  const last3 = getLast3MonthsExpenses(transactions);
  const spendingControlValue = last3.length >= 2 ? 1 - coefficientOfVariation(last3) : 0.5;
  const spendingScore = Math.min(100, spendingControlValue * 100);

  // 3. Diversification (20%) — no single category > 40% of spending
  const categoryShares = getCategoryShares(currentMonth.filter((t) => t.type === "expense"));
  const maxShare = categoryShares.length > 0 ? Math.max(...categoryShares) : 0;
  const diversificationValue = maxShare > 0 ? 1 - Math.max(0, maxShare - 0.4) * 2 : 0.8;
  const diversificationScore = Math.min(100, diversificationValue * 100);

  // 4. Goal progress (15%)
  const goalScore = Math.min(100, goalProgress * 100);

  // 5. Income stability (10%) — income variance
  const last3Income = getLast3MonthsIncome(transactions);
  const stabilityValue = last3Income.length >= 2 ? 1 - Math.min(1, coefficientOfVariation(last3Income)) : 0.5;
  const stabilityScore = Math.min(100, stabilityValue * 100);

  const total = Math.round(
    savingsScore * 0.3 +
    spendingScore * 0.25 +
    diversificationScore * 0.2 +
    goalScore * 0.15 +
    stabilityScore * 0.1
  );

  return {
    total,
    savingsRate: { score: savingsScore, value: savingsRateValue, weight: 30 },
    spendingControl: { score: spendingScore, value: spendingControlValue, weight: 25 },
    diversification: { score: diversificationScore, value: diversificationValue, weight: 20 },
    goalProgress: { score: goalScore, value: goalProgress, weight: 15 },
    incomeStability: { score: stabilityScore, value: stabilityValue, weight: 10 },
    label: getLabel(total),
    color: getColor(total),
  };
}

function getLast3MonthsExpenses(transactions: Transaction[]): number[] {
  const months: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const month = t.date.slice(0, 7);
      months[month] = (months[month] || 0) + t.amount;
    });
  return Object.values(months).slice(-3);
}

function getLast3MonthsIncome(transactions: Transaction[]): number[] {
  const months: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "income")
    .forEach((t) => {
      const month = t.date.slice(0, 7);
      months[month] = (months[month] || 0) + t.amount;
    });
  return Object.values(months).slice(-3);
}

function getCategoryShares(expenses: Transaction[]): number[] {
  const total = expenses.reduce((s, t) => s + t.amount, 0);
  if (total === 0) return [];
  const byCategory: Record<string, number> = {};
  expenses.forEach((t) => {
    const cat = t.category_id || "uncategorized";
    byCategory[cat] = (byCategory[cat] || 0) + t.amount;
  });
  return Object.values(byCategory).map((v) => v / total);
}

function coefficientOfVariation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 0;
  const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance) / mean;
}

function getLabel(score: number): HealthScoreBreakdown["label"] {
  if (score < 30) return "crítico";
  if (score < 50) return "alerta";
  if (score < 65) return "regular";
  if (score < 80) return "bom";
  return "excelente";
}

function getColor(score: number): string {
  if (score < 30) return "#FF4D6A";
  if (score < 50) return "#F59E0B";
  if (score < 65) return "#FBBF24";
  if (score < 80) return "#34D399";
  return "#00D4AA";
}
