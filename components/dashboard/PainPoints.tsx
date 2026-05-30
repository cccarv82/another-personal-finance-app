"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/currency";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface PainPoint {
  title: string;
  diagnosis: string;
  annual_impact: number;
  action: string;
  emoji: string;
}

export function PainPoints() {
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["ai-pain-points"],
    queryFn: async () => {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "pain_points" }),
      });
      if (!res.ok) throw new Error("Falha ao carregar insights");
      const json = await res.json() as { pain_points: PainPoint[] };
      return json.pain_points;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24h
  });

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Pontos de Dor Detectados
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {isLoading ? (
          <>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum ponto de dor detectado. Bom trabalho!
          </p>
        ) : (
          data.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="border border-border rounded-lg overflow-hidden"
            >
              <button
                className="w-full text-left p-3 hover:bg-accent/50 transition-colors"
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg leading-none mt-0.5">{point.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm leading-tight">{point.title}</p>
                    <Badge variant="outline" className="mt-1 text-xs text-amber-400 border-amber-400/30">
                      -{formatCurrency(point.annual_impact)}/ano
                    </Badge>
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {expanded === i && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-2 border-t border-border bg-accent/20">
                      <p className="text-xs text-muted-foreground pt-2 leading-relaxed">
                        {point.diagnosis}
                      </p>
                      <div className="bg-primary/10 border border-primary/20 rounded-md p-2">
                        <p className="text-xs text-primary font-medium">Ação:</p>
                        <p className="text-xs mt-0.5 leading-relaxed">{point.action}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
