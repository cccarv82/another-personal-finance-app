"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, PiggyBank, Landmark } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";

interface QuickStat {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  trend?: number;
}

interface Props {
  income: number;
  expense: number;
  savings: number;
  netWorth: number;
}

export function QuickStats({ income, expense, savings, netWorth }: Props) {
  const stats: QuickStat[] = [
    {
      label: "Receita",
      value: income,
      icon: TrendingUp,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
    },
    {
      label: "Gastos",
      value: expense,
      icon: TrendingDown,
      color: "text-rose-400",
      bgColor: "bg-rose-400/10",
    },
    {
      label: "Poupança",
      value: savings,
      icon: PiggyBank,
      color: savings >= 0 ? "text-emerald-400" : "text-rose-400",
      bgColor: savings >= 0 ? "bg-emerald-400/10" : "bg-rose-400/10",
    },
    {
      label: "Patrimônio",
      value: netWorth,
      icon: Landmark,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map(({ label, value, icon: Icon, color, bgColor }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
        >
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={cn("p-1.5 rounded-md", bgColor)}>
                  <Icon className={cn("w-4 h-4", color)} />
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                <p className={cn("text-lg font-semibold tabular-nums", color)}>
                  {formatCurrency(value)}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
