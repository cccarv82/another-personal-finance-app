"use client";

import { motion } from "framer-motion";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { calculateHealthScore } from "@/lib/ai/health-score";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getLast90DaysRange } from "@/lib/utils/dates";

interface Props {
  monthlyIncome: number;
  goalProgress?: number;
}

export function HealthScore({ monthlyIncome, goalProgress = 0 }: Props) {
  const { start, end } = getLast90DaysRange();
  const { data: transactions, isLoading } = useTransactions({ startDate: start, endDate: end });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-40 w-full rounded-full mx-auto" />
        </CardContent>
      </Card>
    );
  }

  const score = calculateHealthScore(transactions ?? [], monthlyIncome, goalProgress);

  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - (score.total / 100) * circumference;

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4">
          {/* Ring */}
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60" cy="60" r="52"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-muted/30"
              />
              <motion.circle
                cx="60" cy="60" r="52"
                fill="none"
                stroke={score.color}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className="text-4xl font-bold tabular-nums"
                style={{ color: score.color }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {score.total}
              </motion.span>
              <span className="text-xs text-muted-foreground capitalize">{score.label}</span>
            </div>
          </div>

          <div className="text-center">
            <h3 className="font-semibold text-sm">Score de Saúde Financeira</h3>
          </div>

          {/* Breakdown */}
          <div className="w-full space-y-2">
            {[
              { label: "Taxa de poupança", value: score.savingsRate.score, weight: 30 },
              { label: "Controle de gastos", value: score.spendingControl.score, weight: 25 },
              { label: "Diversificação", value: score.diversification.score, weight: 20 },
              { label: "Progresso de metas", value: score.goalProgress.score, weight: 15 },
              { label: "Estabilidade", value: score.incomeStability.score, weight: 10 },
            ].map(({ label, value, weight }) => (
              <div key={label} className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground w-32 shrink-0">{label}</span>
                <div className="flex-1 bg-muted rounded-full h-1.5">
                  <motion.div
                    className="h-1.5 rounded-full"
                    style={{ backgroundColor: score.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
                <span className="text-muted-foreground w-8 text-right">{weight}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
