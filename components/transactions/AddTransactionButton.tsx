"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TransactionDialog } from "./TransactionDialog";

export function AddTransactionButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" className="gap-1.5 text-xs" onClick={() => setOpen(true)}>
        <Plus className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Adicionar</span>
      </Button>
      <TransactionDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
