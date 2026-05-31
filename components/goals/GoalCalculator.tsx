"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils/currency";
import { Calculator } from "lucide-react";

export function GoalCalculator() {
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("0");
  const [months, setMonths] = useState("12");

  const targetAmt = parseFloat(target.replace(",",".")) || 0;
  const currentAmt = parseFloat(current.replace(",",".")) || 0;
  const monthsNum = parseInt(months) || 12;
  const remaining = Math.max(0, targetAmt - currentAmt);
  const monthly = remaining > 0 && monthsNum > 0 ? remaining / monthsNum : 0;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calculator className="w-4 h-4 text-violet-400" />
          Calculadora de Meta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Objetivo (R$)</Label>
            <Input value={target} onChange={e => setTarget(e.target.value)} placeholder="10.000" className="h-8 text-xs" inputMode="decimal" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Já tenho (R$)</Label>
            <Input value={current} onChange={e => setCurrent(e.target.value)} placeholder="0" className="h-8 text-xs" inputMode="decimal" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Em quantos meses?</Label>
            <Input value={months} onChange={e => setMonths(e.target.value)} placeholder="12" className="h-8 text-xs" inputMode="numeric" />
          </div>
        </div>

        {monthly > 0 && (
          <div className="bg-primary/10 border border-primary/20 rounded-md p-3 text-center">
            <p className="text-xs text-muted-foreground">Você precisa guardar</p>
            <p className="text-xl font-bold text-primary tabular-nums">{formatCurrency(monthly)}<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
            <p className="text-xs text-muted-foreground mt-1">para atingir {formatCurrency(targetAmt)} em {monthsNum} meses</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
