"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/currency";
import { getLast90DaysRange } from "@/lib/utils/dates";
import { AlertTriangle, Zap } from "lucide-react";

// Benchmarks: median Brazilian family spending by category (% of income)
const BR_BENCHMARKS: Record<string, number> = {
  "Moradia": 30, "Alimentação": 18, "Transporte": 15, "Saúde": 8,
  "Educação": 5, "Lazer": 7, "Roupas": 4, "Assinaturas": 2, "Delivery": 5,
};

export function DiagnosticMode() {
  const [enabled, setEnabled] = useState(false);
  const supabase = createClient();
  const { start, end } = getLast90DaysRange();

  const { data, isLoading } = useQuery({
    queryKey: ["diagnostic"],
    enabled,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const [txRes, profRes] = await Promise.all([
        supabase.from("transactions").select("amount, type, categories(name)")
          .eq("user_id", user.id).gte("date", start).lte("date", end),
        supabase.from("profiles").select("monthly_income").eq("id", user.id).single(),
      ]);

      const txs = txRes.data ?? [];
      type TRow = { amount: number; type: string; categories?: { name: string } | null };
      const income = (txs as unknown as TRow[]).filter(t => t.type === "income")
        .reduce((s, t) => s + t.amount, 0) / 3;
      const monthlyIncome = profRes.data?.monthly_income ?? (income || 1);

      const byCategory: Record<string, number> = {};
      (txs as unknown as TRow[]).filter(t => t.type === "expense").forEach(t => {
        const name = t.categories?.name ?? "Outros";
        byCategory[name] = (byCategory[name] || 0) + t.amount / 3;
      });

      const totalExpense = Object.values(byCategory).reduce((a, b) => a + b, 0);
      const savingsRate = Math.max(0, (monthlyIncome - totalExpense) / monthlyIncome);

      const issues = Object.entries(byCategory)
        .map(([cat, monthly]) => {
          const pct = monthly / monthlyIncome * 100;
          const benchmark = BR_BENCHMARKS[cat];
          return { cat, monthly, pct, benchmark, excess: benchmark ? pct - benchmark : 0 };
        })
        .filter(i => i.excess > 5)
        .sort((a, b) => b.excess - a.excess);

      return { savingsRate, totalExpense, monthlyIncome, issues };
    },
  });

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Modo Diagnóstico
          </CardTitle>
          <button
            onClick={() => setEnabled(e => !e)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${enabled ? "bg-amber-400" : "bg-muted"}`}
          >
            <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Análise brutal e honesta das suas finanças. Sem filtros.</p>
      </CardHeader>

      {enabled && (
        <CardContent className="space-y-3">
          {isLoading && <p className="text-xs text-muted-foreground">Analisando...</p>}

          {data && (
            <>
              {/* Savings rate verdict */}
              <div className={`rounded-md p-3 border ${
                data.savingsRate < 0.1 ? "border-rose-500/30 bg-rose-500/10" :
                data.savingsRate < 0.2 ? "border-amber-500/30 bg-amber-500/10" :
                "border-emerald-500/30 bg-emerald-500/10"
              }`}>
                <p className="text-xs font-semibold">
                  Taxa de poupança: {(data.savingsRate * 100).toFixed(1)}%
                  {data.savingsRate < 0.1 && " — CRÍTICO"}
                  {data.savingsRate >= 0.1 && data.savingsRate < 0.2 && " — Abaixo do ideal"}
                  {data.savingsRate >= 0.2 && " — Bom"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.savingsRate < 0.1
                    ? "Você está gastando quase tudo que ganha. Qualquer emergência vai te deixar no vermelho."
                    : data.savingsRate < 0.2
                    ? "Abaixo dos 20% recomendados. Você está vulnerável a imprevistos."
                    : "Parabéns, você está poupando acima do mínimo recomendado."}
                </p>
              </div>

              {/* Categoria acima do benchmark */}
              {data.issues.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium flex items-center gap-1 text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Categorias acima da média brasileira
                  </p>
                  {data.issues.map(issue => (
                    <div key={issue.cat} className="flex items-center gap-2 text-xs">
                      <span className="w-24 shrink-0 font-medium">{issue.cat}</span>
                      <span className="text-rose-400 tabular-nums">{formatCurrency(issue.monthly)}/mês</span>
                      <Badge variant="outline" className="text-rose-400 border-rose-400/30 text-[10px]">
                        +{issue.excess.toFixed(0)}% vs média
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {data.issues.length === 0 && (
                <p className="text-xs text-emerald-400">Seus gastos estão dentro dos benchmarks brasileiros. Bom trabalho!</p>
              )}

              {/* Comparação anônima */}
              <div className="border-t border-border pt-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">📊 Comparação com a média brasileira</p>
                <p>Taxa de poupança média BR: <strong>7-12%</strong> · Sua taxa: <strong className={data.savingsRate > 0.12 ? "text-emerald-400" : "text-rose-400"}>{(data.savingsRate * 100).toFixed(1)}%</strong></p>
                <p className="mt-0.5">
                  {data.savingsRate > 0.12
                    ? "✓ Você poupa mais que a maioria dos brasileiros com renda similar."
                    : "✗ Você está abaixo da média de poupança brasileira."}
                </p>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}
