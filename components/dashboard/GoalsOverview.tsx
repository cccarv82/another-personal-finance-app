"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/currency";
import { Target, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";

export function GoalsOverview() {
  const supabase = createClient();

  const { data: goals, isLoading } = useQuery({
    queryKey: ["goals-overview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_goals")
        .select("*")
        .eq("is_completed", false)
        .order("target_date", { ascending: true })
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <Skeleton className="h-32 w-full" />;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 text-violet-400" />
            Metas financeiras
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" asChild>
            <Link href="/goals">
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!goals || goals.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <p className="text-sm text-muted-foreground">Nenhuma meta criada ainda</p>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" asChild>
              <Link href="/goals">
                <Plus className="w-3.5 h-3.5" /> Criar meta
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {goals.map((goal, i) => {
              const pct = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="space-y-1.5"
                >
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-medium truncate max-w-[60%]">{goal.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                  <div className="flex justify-between text-[10px] text-muted-foreground tabular-nums">
                    <span>{formatCurrency(goal.current_amount)}</span>
                    <span>{formatCurrency(goal.target_amount)}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
