"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Profile } from "@/lib/supabase/types";

interface Props {
  profile: Profile | null;
}

const GOALS_OPTIONS = [
  "Reserva de emergência",
  "Aposentadoria",
  "Casa própria",
  "Viagem",
  "Independência financeira",
  "Quitar dívidas",
  "Outro",
];

export function SettingsClient({ profile }: Props) {
  const [name, setName] = useState(profile?.name ?? "");
  const [income, setIncome] = useState(String(profile?.monthly_income ?? ""));
  const [goal, setGoal] = useState(profile?.financial_goal ?? "");
  const [lifestyle, setLifestyle] = useState(String(profile?.lifestyle_level ?? 3));
  const supabase = createClient();

  const save = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");
      const { error } = await supabase.from("profiles").update({
        name,
        monthly_income: parseFloat(income.replace(",", ".")) || null,
        financial_goal: goal || null,
        lifestyle_level: parseInt(lifestyle),
      }).eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => toast.success("Perfil atualizado!"),
    onError: (e) => toast.error("Erro: " + e.message),
  });

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold">Configurações</h1>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm">Perfil financeiro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
          </div>

          <div className="space-y-1.5">
            <Label>Renda mensal (R$)</Label>
            <Input
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="Ex: 5000"
              inputMode="decimal"
            />
            <p className="text-xs text-muted-foreground">
              Usado para calcular sua taxa de poupança e health score
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Meta financeira principal</Label>
            <Select value={goal} onValueChange={(v) => v && setGoal(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma meta" />
              </SelectTrigger>
              <SelectContent>
                {GOALS_OPTIONS.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Estilo de vida ({lifestyle}/5)</Label>
            <Select value={lifestyle} onValueChange={(v) => v && setLifestyle(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 — Muito simples</SelectItem>
                <SelectItem value="2">2 — Simples</SelectItem>
                <SelectItem value="3">3 — Moderado</SelectItem>
                <SelectItem value="4">4 — Confortável</SelectItem>
                <SelectItem value="5">5 — Luxo</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Ajuda a IA a calibrar as sugestões para sua realidade
            </p>
          </div>

          <Button className="w-full" onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Salvar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
