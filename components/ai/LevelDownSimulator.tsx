"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/utils/currency";
import { motion } from "framer-motion";
import { TrendingDown, Zap } from "lucide-react";

const PERIOD_LABELS = ["6 meses", "1 ano", "3 anos"];
const PERIOD_MONTHS = [6, 12, 36];

export function LevelDownSimulator() {
  const supabase = createClient();
  const [reductions, setReductions] = useState<Record<string, number>>({});
  const [periodIndex, setPeriodIndex] = useState(1);

  const { data: categories } = useQuery({
    queryKey: ["spending-by-category"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const now = new Date();
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1)
        .toISOString().split("T")[0];
      const { data } = await supabase
        .from("transactions")
        .select("amount, category_id, categories(name, color)")
        .eq("user_id", user.id)
        .eq("type", "expense")
        .gte("date", threeMonthsAgo);

      const byCategory: Record<string, { name: string; color: string | null; total: number }> = {};
      type TRow = { amount: number; category_id: string | null; categories?: { name: string; color: string | null } | null };
      ((data ?? []) as unknown as TRow[]).forEach((t) => {
        const key = t.category_id ?? "sem-cat";
        const name = t.categories?.name ?? "Outros";
        const color = t.categories?.color ?? null;
        if (!byCategory[key]) byCategory[key] = { name, color, total: 0 };
        byCategory[key].total += t.amount;
      });

      return Object.entries(byCategory)
        .map(([id, v]) => ({ id, ...v, monthly: v.total / 3 }))
        .sort((a, b) => b.monthly - a.monthly)
        .slice(0, 6);
    },
  });

  const months = PERIOD_MONTHS[periodIndex];

  const totalSavings = useMemo(() => {
    return (categories ?? []).reduce((sum, cat) => {
      const pct = (reductions[cat.id] ?? 0) / 100;
      return sum + cat.monthly * pct * months;
    }, 0);
  }, [categories, reductions, months]);

  const monthlySavings = useMemo(() => {
    return (categories ?? []).reduce((sum, cat) => {
      const pct = (reductions[cat.id] ?? 0) / 100;
      return sum + cat.monthly * pct;
    }, 0);
  }, [categories, reductions]);

  if (!categories || categories.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Adicione transações para usar o simulador.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-primary" />
          Simulador "Viver um Nível Abaixo"
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Arraste os sliders para ver quanto você economizaria reduzindo cada categoria
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Period selector */}
        <div className="flex gap-1.5">
          {PERIOD_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={() => setPeriodIndex(i)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                periodIndex === i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Category sliders */}
        <div className="space-y-4">
          {categories.map((cat) => {
            const pct = reductions[cat.id] ?? 0;
            const saved = cat.monthly * (pct / 100) * months;
            return (
              <div key={cat.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium">{cat.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({formatCurrency(cat.monthly)}/mês)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-muted-foreground">{pct}% menos</span>
                    {saved > 0 && (
                      <span className="text-xs text-emerald-400 ml-2">
                        +{formatCurrency(saved)}
                      </span>
                    )}
                  </div>
                </div>
                <Slider
                  value={[pct]}
                  onValueChange={(vals: number[]) => setReductions(r => ({ ...r, [cat.id]: vals[0] ?? 0 }))}
                  min={0} max={100} step={5}
                  className="w-full"
                />
              </div>
            );
          })}
        </div>

        {/* Result */}
        {monthlySavings > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/10 border border-primary/20 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Resultado em {PERIOD_LABELS[periodIndex]}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Economia mensal</p>
                <p className="text-lg font-bold tabular-nums text-emerald-400">{formatCurrency(monthlySavings)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total acumulado</p>
                <p className="text-lg font-bold tabular-nums text-emerald-400">{formatCurrency(totalSavings)}</p>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
