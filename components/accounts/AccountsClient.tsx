"use client";

import { useState } from "react";
import { useAccounts, useCreateAccount, useTotalNetWorth } from "@/lib/hooks/useAccounts";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils/currency";
import { Plus, Wallet, CreditCard, TrendingUp, Banknote, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AccountType } from "@/lib/supabase/types";

const ACCOUNT_ICONS: Record<AccountType, React.ElementType> = {
  checking: Building2,
  savings: Banknote,
  investment: TrendingUp,
  credit: CreditCard,
  cash: Wallet,
  wallet: Wallet,
};

const ACCOUNT_LABELS: Record<AccountType, string> = {
  checking: "Conta corrente",
  savings: "Poupança",
  investment: "Investimentos",
  credit: "Cartão de crédito",
  cash: "Dinheiro",
  wallet: "Carteira digital",
};

const ACCOUNT_COLORS: Record<AccountType, string> = {
  checking: "from-blue-500/20 to-blue-600/10",
  savings: "from-emerald-500/20 to-emerald-600/10",
  investment: "from-violet-500/20 to-violet-600/10",
  credit: "from-rose-500/20 to-rose-600/10",
  cash: "from-amber-500/20 to-amber-600/10",
  wallet: "from-cyan-500/20 to-cyan-600/10",
};

export function AccountsClient() {
  const { data: accounts, isLoading } = useAccounts();
  const createAccount = useCreateAccount();
  const netWorth = useTotalNetWorth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("checking");
  const [balance, setBalance] = useState("0");

  async function handleCreate() {
    await createAccount.mutateAsync({ name, type, balance: parseFloat(balance.replace(",", ".")) });
    setOpen(false);
    setName("");
    setBalance("0");
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Patrimônio líquido: <span className="text-foreground font-semibold tabular-nums">{formatCurrency(netWorth)}</span>
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" /> Nova conta
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 w-full" />)}
        </div>
      ) : !accounts || accounts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          <p>Nenhuma conta cadastrada.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setOpen(true)}>
            Adicionar conta
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc, i) => {
            const Icon = ACCOUNT_ICONS[acc.type as AccountType] ?? Wallet;
            const gradient = ACCOUNT_COLORS[acc.type as AccountType] ?? "from-primary/20 to-primary/10";
            return (
              <motion.div
                key={acc.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07 }}
              >
                <Card className={cn("bg-gradient-to-br border-border overflow-hidden", gradient)}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 bg-background/30 rounded-lg">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] text-muted-foreground capitalize">
                        {ACCOUNT_LABELS[acc.type as AccountType]}
                      </span>
                    </div>
                    <div>
                      <p className="text-xl font-bold tabular-nums">{formatCurrency(acc.balance)}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{acc.name}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nova conta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Nubank, Itaú..." />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as AccountType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(ACCOUNT_LABELS) as [AccountType, string][]).map(([val, label]) => (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Saldo inicial (R$)</Label>
              <Input value={balance} onChange={(e) => setBalance(e.target.value)} inputMode="decimal" />
            </div>
            <Button className="w-full" onClick={handleCreate} disabled={!name || createAccount.isPending}>
              Criar conta
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
