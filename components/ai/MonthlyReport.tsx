"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentPeriod, getPeriodLabel } from "@/lib/utils/dates";
import { CheckCircle2, AlertCircle, Target, RefreshCw } from "lucide-react";

interface Report {
  headline: string;
  summary: string;
  achievements: string[];
  alerts: string[];
  challenge: string;
  score_delta: number;
}

export function MonthlyReport() {
  const period = getCurrentPeriod();

  const { data: report, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["monthly-report", period],
    queryFn: async () => {
      const res = await fetch("/api/ai/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period }),
      });
      if (!res.ok) throw new Error("Falha ao gerar relatório");
      return res.json() as Promise<Report>;
    },
    staleTime: 1000 * 60 * 60 * 12,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">
          {getPeriodLabel(period)}
        </h2>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Headline */}
      <Card className="bg-card border-border">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-lg leading-tight">{report.headline}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{report.summary}</p>
            </div>
            {report.score_delta !== 0 && (
              <Badge
                className={`shrink-0 ${report.score_delta > 0 ? "bg-emerald-400/20 text-emerald-400" : "bg-rose-400/20 text-rose-400"}`}
              >
                {report.score_delta > 0 ? "+" : ""}{report.score_delta} pts
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Achievements */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {report.achievements.map((a, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="text-xs text-muted-foreground leading-relaxed flex gap-2"
              >
                <span className="text-emerald-400 mt-0.5">✓</span>
                {a}
              </motion.p>
            ))}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {report.alerts.map((a, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="text-xs text-muted-foreground leading-relaxed flex gap-2"
              >
                <span className="text-amber-400 mt-0.5">!</span>
                {a}
              </motion.p>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Challenge */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 flex gap-3">
          <Target className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-primary mb-1">Desafio do próximo mês</p>
            <p className="text-sm leading-relaxed">{report.challenge}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
