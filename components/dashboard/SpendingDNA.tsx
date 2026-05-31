"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils/currency";
import { getMonthRange } from "@/lib/utils/dates";
import { Dna } from "lucide-react";

const COLORS = ["#00D4AA","#6C8EFF","#A78BFA","#F59E0B","#FF4D6A","#34D399","#60A5FA","#FB923C"];

const BENCHMARKS: Record<string, number> = {
  "Moradia": 30,
  "Alimentação": 20,
  "Transporte": 15,
  "Saúde": 8,
  "Educação": 5,
  "Lazer": 10,
  "Roupas": 5,
  "Assinaturas": 3,
  "Outros": 4,
};

export function SpendingDNA() {
  const supabase = createClient();
  const { start, end } = getMonthRange();

  const { data, isLoading } = useQuery({
    queryKey: ["spending-dna", start],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: txs } = await supabase
        .from("transactions")
        .select("amount, categories(name, color)")
        .eq("user_id", user.id)
        .eq("type", "expense")
        .gte("date", start)
        .lte("date", end);

      if (!txs || txs.length === 0) return null;

      const total = txs.reduce((s, t) => s + t.amount, 0);
      const byCategory: Record<string, number> = {};
      type TRow = { amount: number; categories?: { name: string } | null };
      (txs as unknown as TRow[]).forEach((t) => {
        const name = t.categories?.name ?? "Outros";
        byCategory[name] = (byCategory[name] || 0) + t.amount;
      });

      return Object.entries(byCategory)
        .map(([name, value]) => ({
          name,
          value,
          pct: Math.round((value / total) * 100),
          ideal: BENCHMARKS[name] ?? 5,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
    },
  });

  if (isLoading) return <Skeleton className="h-48 w-full" />;
  if (!data) return null;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Dna className="w-4 h-4 text-violet-400" />
          DNA de Gastos
        </CardTitle>
        <p className="text-xs text-muted-foreground">Comparado ao perfil ideal</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <ResponsiveContainer width="45%" height={160}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip
                formatter={((v: unknown) => formatCurrency(Number(v))) as never}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex-1 space-y-2">
            {data.slice(0, 5).map((item, i) => {
              const diff = item.pct - item.ideal;
              return (
                <div key={item.name} className="space-y-0.5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs truncate max-w-[80px]" style={{ color: COLORS[i % COLORS.length] }}>
                      {item.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs tabular-nums font-medium">{item.pct}%</span>
                      {diff > 5 && <span className="text-[10px] text-rose-400">▲{diff}%</span>}
                      {diff < -5 && <span className="text-[10px] text-emerald-400">▼{Math.abs(diff)}%</span>}
                    </div>
                  </div>
                  <div className="relative h-1 bg-muted rounded-full">
                    <div
                      className="absolute h-1 rounded-full transition-all"
                      style={{ width: `${Math.min(100, item.pct)}%`, backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <div
                      className="absolute h-full w-0.5 bg-white/30"
                      style={{ left: `${item.ideal}%` }}
                      title={`Ideal: ${item.ideal}%`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
