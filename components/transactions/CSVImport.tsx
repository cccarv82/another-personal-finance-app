"use client";

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { parseGenericCSV, parseNubank, parseInter, parseBradesco, parseItau, parseC6, type ParsedTransaction } from "@/lib/utils/csv-import";
import { categorizeTransactions, resolveOrCreateCategories, type CategorizedTransaction } from "@/lib/ai/categorize";
import { useAccounts } from "@/lib/hooks/useAccounts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/currency";
import { createClient } from "@/lib/supabase/client";
import { Upload, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PARSERS: Record<string, (csv: string) => ParsedTransaction[]> = {
  auto: parseGenericCSV,
  nubank: parseNubank,
  inter: parseInter,
  bradesco: parseBradesco,
  itau: parseItau,
  c6: parseC6,
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CSVImport({ open, onClose }: Props) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<CategorizedTransaction[]>([]);
  const [bank, setBank] = useState("auto");
  const [accountId, setAccountId] = useState("");
  const [importing, setImporting] = useState(false);
  const [categorizing, setCategorizing] = useState(false);
  const [done, setDone] = useState(false);

  const { data: accounts = [] } = useAccounts();
  const supabase = createClient();
  const queryClient = useQueryClient();

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const parsed = PARSERS[bank](text);
      setPreview(parsed.map((t) => ({ ...t })));
      setCategorizing(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const categorized = await categorizeTransactions(parsed);
          const withIds = await resolveOrCreateCategories(categorized, supabase, user.id);
          setPreview(withIds);
          queryClient.invalidateQueries({ queryKey: ["categories"] });
        }
      } catch {
        // categorization failed, keep uncategorized preview
      } finally {
        setCategorizing(false);
      }
    };
    reader.readAsText(file, "UTF-8");
  }, [bank, supabase, queryClient]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".csv")) handleFile(file);
  }, [handleFile]);

  async function handleImport() {
    if (!accountId || preview.length === 0) return;
    setImporting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setImporting(false); return; }

    let ok = 0;
    for (const tx of preview) {
      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        account_id: accountId,
        type: tx.type,
        amount: tx.amount,
        description: tx.description,
        date: tx.date,
        category_id: tx.category_id ?? null,
      });
      if (!error) ok++;
    }

    setImporting(false);
    setDone(true);
    toast.success(`${ok} transações importadas!`);
    setTimeout(() => { setDone(false); setPreview([]); onClose(); }, 1500);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Banco / formato</label>
              <Select value={bank} onValueChange={(v) => v && setBank(v)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Detectar automaticamente</SelectItem>
                  <SelectItem value="nubank">Nubank</SelectItem>
                  <SelectItem value="inter">Banco Inter</SelectItem>
                  <SelectItem value="bradesco">Bradesco</SelectItem>
                  <SelectItem value="itau">Itaú</SelectItem>
                  <SelectItem value="c6">C6 Bank</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Conta destino</label>
              <Select value={accountId} onValueChange={(v) => v && setAccountId(v)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Drop zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            )}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => {
              const el = document.createElement("input");
              el.type = "file"; el.accept = ".csv";
              el.onchange = (e) => {
                const f = (e.target as HTMLInputElement).files?.[0];
                if (f) handleFile(f);
              };
              el.click();
            }}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">Arraste o arquivo CSV aqui</p>
            <p className="text-xs text-muted-foreground mt-1">ou clique para selecionar</p>
            <p className="text-xs text-muted-foreground mt-2">Suporte: Nubank, Inter, Bradesco, Itaú, C6, genérico</p>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium">{preview.length} transações detectadas</p>
                  {categorizing && (
                    <span className="flex items-center gap-1 text-xs text-primary">
                      <Sparkles className="w-3 h-3 animate-pulse" /> categorizando...
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 text-xs">
                    {preview.filter(t => t.type === "income").length} receitas
                  </Badge>
                  <Badge variant="outline" className="text-rose-400 border-rose-400/30 text-xs">
                    {preview.filter(t => t.type === "expense").length} gastos
                  </Badge>
                  {!categorizing && preview.filter(t => t.category_id).length > 0 && (
                    <Badge variant="outline" className="text-primary border-primary/30 text-xs">
                      {preview.filter(t => t.category_id).length} categorizadas
                    </Badge>
                  )}
                </div>
              </div>
              <div className="max-h-52 overflow-y-auto space-y-1 rounded-md border border-border p-2">
                {preview.slice(0, 25).map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs py-1">
                    <span className="text-muted-foreground w-20 shrink-0">{t.date}</span>
                    <div className="flex-1 min-w-0">
                      <span className="truncate block">{t.description}</span>
                      {t.suggestedCategory && (
                        <span className="text-[10px] text-muted-foreground">
                          {t.suggestedCategory.icon} {t.suggestedCategory.name}
                        </span>
                      )}
                    </div>
                    <span className={cn("tabular-nums font-medium shrink-0", t.type === "income" ? "text-emerald-400" : "text-rose-400")}>
                      {t.type === "expense" ? "-" : "+"}{formatCurrency(t.amount)}
                    </span>
                  </div>
                ))}
                {preview.length > 25 && (
                  <p className="text-xs text-muted-foreground text-center py-1">+ {preview.length - 25} mais...</p>
                )}
              </div>

              <Button
                className="w-full"
                onClick={handleImport}
                disabled={!accountId || importing || done || categorizing}
              >
                {importing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> :
                 done ? <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" /> :
                 categorizing ? <Sparkles className="w-4 h-4 animate-pulse mr-2" /> :
                 <Upload className="w-4 h-4 mr-2" />}
                {done ? "Importado!" : importing ? "Importando..." : categorizing ? "Categorizando..." : `Importar ${preview.length} transações`}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
