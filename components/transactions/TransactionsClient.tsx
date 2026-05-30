"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTransactions, useDeleteTransaction } from "@/lib/hooks/useTransactions";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateRelative } from "@/lib/utils/dates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AddTransactionButton } from "./AddTransactionButton";
import { Search, Trash2, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TransactionsClient() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const deleteTx = useDeleteTransaction();

  const { data: transactions, isLoading } = useTransactions({
    search: search || undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
  });

  // Group by date
  const grouped: Record<string, typeof transactions> = {};
  (transactions ?? []).forEach((tx) => {
    const key = tx.date;
    if (!grouped[key]) grouped[key] = [];
    grouped[key]!.push(tx);
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transações</h1>
        <AddTransactionButton />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => v && setTypeFilter(v)}>
          <SelectTrigger className="h-8 w-32 text-xs">
            <Filter className="w-3 h-3 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="expense">Gastos</SelectItem>
            <SelectItem value="income">Receitas</SelectItem>
            <SelectItem value="transfer">Transferências</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transaction list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Nenhuma transação encontrada
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, txs]) => (
              <div key={date}>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {formatDateRelative(date)}
                </p>
                <div className="space-y-1">
                  {txs?.map((tx, i) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-border/60 transition-colors group"
                    >
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center text-sm shrink-0"
                        style={{
                          background:
                            tx.type === "income"
                              ? "rgba(0,212,170,0.15)"
                              : tx.type === "expense"
                              ? "rgba(255,77,106,0.15)"
                              : "rgba(108,142,255,0.15)",
                        }}
                      >
                        {tx.categories?.icon ?? (tx.type === "income" ? "↑" : tx.type === "expense" ? "↓" : "↔")}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{tx.description}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {tx.categories?.name && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                              {tx.categories.name}
                            </Badge>
                          )}
                          {tx.accounts?.name && (
                            <span className="text-[10px] text-muted-foreground">{tx.accounts.name}</span>
                          )}
                        </div>
                      </div>

                      <span
                        className={cn(
                          "text-sm font-semibold tabular-nums",
                          tx.type === "income" ? "text-emerald-400" : tx.type === "expense" ? "text-rose-400" : "text-blue-400"
                        )}
                      >
                        {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}
                        {formatCurrency(tx.amount)}
                      </span>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          toast.warning("Remover transação?", {
                            action: {
                              label: "Confirmar",
                              onClick: () => deleteTx.mutate(tx.id),
                            },
                          });
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
