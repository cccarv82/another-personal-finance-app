"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateRelative } from "@/lib/utils/dates";
import { getMonthRange } from "@/lib/utils/dates";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function RecentTransactions() {
  const { start, end } = getMonthRange();
  const { data, isLoading } = useTransactions({ startDate: start, endDate: end, limit: 7 });

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Últimas transações</CardTitle>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" asChild>
            <Link href="/transactions">
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhuma transação ainda.
          </p>
        ) : (
          data.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-accent/50 transition-colors"
            >
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center text-sm shrink-0"
                style={{
                  background:
                    tx.type === "income"
                      ? "rgba(0,212,170,0.15)"
                      : tx.type === "expense"
                      ? "rgba(255,77,106,0.15)"
                      : "rgba(108,142,255,0.15)",
                }}
              >
                {tx.type === "income" ? "↑" : tx.type === "expense" ? "↓" : "↔"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{tx.description}</p>
                <p className="text-[10px] text-muted-foreground">
                  {formatDateRelative(tx.date)}
                  {tx.categories?.name && ` · ${tx.categories.name}`}
                </p>
              </div>
              <span
                className={cn(
                  "text-xs font-semibold tabular-nums shrink-0",
                  tx.type === "income" ? "text-emerald-400" : tx.type === "expense" ? "text-rose-400" : "text-blue-400"
                )}
              >
                {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}
                {formatCurrency(tx.amount)}
              </span>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
