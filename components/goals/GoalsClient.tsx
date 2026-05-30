"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils/currency";
import { Plus, Target, Check } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

const GOAL_CATEGORIES = [
  { value: "emergency", label: "Reserva de emergência", emoji: "🛡️" },
  { value: "investment", label: "Investimento", emoji: "📈" },
  { value: "purchase", label: "Compra", emoji: "🛒" },
  { value: "travel", label: "Viagem", emoji: "✈️" },
  { value: "education", label: "Educação", emoji: "📚" },
  { value: "other", label: "Outro", emoji: "🎯" },
];

export function GoalsClient() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("0");
  const [category, setCategory] = useState("other");
  const [targetDate, setTargetDate] = useState("");
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: goals, isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("financial_goals").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createGoal = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");
      const { error } = await supabase.from("financial_goals").insert({
        user_id: user.id,
        name,
        target_amount: parseFloat(target.replace(",", ".")),
        current_amount: parseFloat(current.replace(",", ".")),
        category,
        target_date: targetDate || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["goals-overview"] });
      toast.success("Meta criada!");
      setOpen(false);
      setName(""); setTarget(""); setCurrent("0"); setTargetDate("");
    },
  });

  const markComplete = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("financial_goals").update({ is_completed: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      toast.success("🎉 Meta concluída! Parabéns!");
    },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Metas Financeiras</h1>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" /> Nova meta
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      ) : !goals || goals.length === 0 ? (
        <div className="text-center py-16">
          <Target className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Nenhuma meta criada ainda</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setOpen(true)}>
            Criar primeira meta
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence>
            {goals.map((goal, i) => {
              const pct = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
              const cat = GOAL_CATEGORIES.find((c) => c.value === goal.category);
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card className={`bg-card border-border ${goal.is_completed ? "opacity-60" : ""}`}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className="text-2xl">{cat?.emoji ?? "🎯"}</span>
                          <p className="font-semibold mt-1">{goal.name}</p>
                          <p className="text-xs text-muted-foreground">{cat?.label}</p>
                        </div>
                        {!goal.is_completed && pct >= 100 && (
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10"
                            onClick={() => markComplete.mutate(goal.id)}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {goal.is_completed && (
                          <span className="text-xs text-emerald-400 font-medium">Concluída ✓</span>
                        )}
                      </div>

                      <Progress value={pct} className="h-2 mb-2" />

                      <div className="flex justify-between text-xs tabular-nums">
                        <span className="text-muted-foreground">{formatCurrency(goal.current_amount)}</span>
                        <span className="font-medium">{formatCurrency(goal.target_amount)}</span>
                      </div>

                      {goal.target_date && (
                        <p className="text-[10px] text-muted-foreground mt-2">
                          Meta: {new Date(goal.target_date).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nova meta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome da meta</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Reserva emergência..." />
            </div>
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.emoji} {c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Valor alvo (R$)</Label>
                <Input value={target} onChange={(e) => setTarget(e.target.value)} inputMode="decimal" placeholder="10.000" />
              </div>
              <div className="space-y-1.5">
                <Label>Valor atual (R$)</Label>
                <Input value={current} onChange={(e) => setCurrent(e.target.value)} inputMode="decimal" placeholder="0" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Data alvo (opcional)</Label>
              <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
            </div>
            <Button className="w-full" onClick={() => createGoal.mutate()} disabled={!name || !target || createGoal.isPending}>
              Criar meta
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
