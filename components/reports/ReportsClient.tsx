"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils/currency";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

const CHART_COLORS = ["#00D4AA", "#6C8EFF", "#A78BFA", "#F59E0B", "#FF4D6A", "#34D399", "#60A5FA"];

export function ReportsClient() {
  const supabase = createClient();

  const { data, isLoading } = useQuery({
    queryKey: ["reports-data"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const sixMonthsAgo = format(subMonths(new Date(), 5), "yyyy-MM-01");

      const [txResult, catResult] = await Promise.all([
        supabase
          .from("transactions")
          .select("type, amount, date, category_id")
          .eq("user_id", user.id)
          .gte("date", sixMonthsAgo),
        supabase.from("categories").select("id, name").eq("user_id", user.id),
      ]);

      const transactions = txResult.data ?? [];
      const catMap: Record<string, string> = {};
      (catResult.data ?? []).forEach((c) => { catMap[c.id] = c.name; });

      // Monthly summary (last 6 months)
      const monthlyMap: Record<string, { income: number; expense: number; savings: number }> = {};
      for (let i = 5; i >= 0; i--) {
        const d = subMonths(new Date(), i);
        const key = format(d, "yyyy-MM");
        monthlyMap[key] = { income: 0, expense: 0, savings: 0 };
      }

      transactions.forEach((t) => {
        const key = t.date.slice(0, 7);
        if (!monthlyMap[key]) return;
        if (t.type === "income") monthlyMap[key].income += t.amount;
        if (t.type === "expense") monthlyMap[key].expense += t.amount;
      });

      Object.values(monthlyMap).forEach((m) => { m.savings = m.income - m.expense; });

      const monthlyData = Object.entries(monthlyMap).map(([month, data]) => ({
        month: format(new Date(month + "-01"), "MMM", { locale: ptBR }),
        ...data,
      }));

      // Category breakdown (current month)
      const now = format(new Date(), "yyyy-MM");
      const categoryMap: Record<string, number> = {};
      transactions
        .filter((t) => t.type === "expense" && t.date.startsWith(now))
        .forEach((t) => {
          const name = catMap[t.category_id ?? ""] ?? "Sem categoria";
          categoryMap[name] = (categoryMap[name] || 0) + t.amount;
        });

      const categoryData = Object.entries(categoryMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 7)
        .map(([name, value]) => ({ name, value }));

      return { monthlyData, categoryData };
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const customTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (!active || !payload) return null;
    return (
      <div className="bg-popover border border-border rounded-lg p-2.5 text-xs shadow-md">
        <p className="font-medium mb-1.5">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold">Relatórios</h1>

      {/* Income vs Expense — bar chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Receitas vs Gastos (6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.monthlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={customTooltip as unknown as never} />
                <Bar dataKey="income" name="Receita" fill="#00D4AA" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Gastos" fill="#FF4D6A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Savings trend */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Poupança mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={data?.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={customTooltip as unknown as never} />
                  <Line
                    type="monotone"
                    dataKey="savings"
                    name="Poupança"
                    stroke="#6C8EFF"
                    strokeWidth={2}
                    dot={{ fill: "#6C8EFF", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category breakdown */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Gastos por categoria (mês atual)</CardTitle>
            </CardHeader>
            <CardContent>
              {!data?.categoryData || data.categoryData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum gasto registrado</p>
              ) : (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="50%" height={180}>
                    <PieChart>
                      <Pie
                        data={data.categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {data.categoryData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-1.5">
                    {data.categoryData.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-1.5 text-xs">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                        <span className="text-muted-foreground truncate flex-1">{item.name}</span>
                        <span className="tabular-nums font-medium">{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
