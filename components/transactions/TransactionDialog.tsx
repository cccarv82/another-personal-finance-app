"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTransaction } from "@/lib/hooks/useTransactions";
import { useAccounts } from "@/lib/hooks/useAccounts";
import { useCategories } from "@/lib/hooks/useCategories";
import { createClient } from "@/lib/supabase/client";
import { format, subDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, Clock, RepeatIcon } from "lucide-react";
import { useState } from "react";

// Keyword → category name mapping for autocomplete
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Alimentação": ["restaurante","almoço","jantar","lanche","comida","refeição","ifood","rappi"],
  "Delivery": ["delivery","uber eats","ifood","rappi","james"],
  "Supermercado": ["supermercado","mercado","extra","pão de açúcar","atacado","hortifruti"],
  "Transporte": ["uber","99","táxi","combustível","gasolina","estacionamento","pedágio","metrô","onibus"],
  "Saúde": ["farmácia","remédio","médico","consulta","exame","hospital","plano de saúde"],
  "Assinaturas": ["netflix","spotify","amazon","apple","disney","youtube","prime","adobe"],
  "Moradia": ["aluguel","condomínio","água","luz","energia","internet","iptu"],
  "Educação": ["curso","escola","faculdade","livro","mensalidade"],
  "Lazer": ["cinema","teatro","bar","academia","jogo","viagem"],
  "Roupas": ["roupa","calçado","tênis","camiseta","shein","zara"],
  "Pets": ["pet","veterinário","ração"],
  "Salário": ["salário","pagamento","holerite"],
  "Freelance": ["freelance","projeto","honorários","consultoria"],
};

function detectCategory(description: string, categories: Array<{id: string; name: string}>): string | undefined {
  const lower = description.toLowerCase();
  for (const [catName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      const match = categories.find(c => c.name.toLowerCase().includes(catName.toLowerCase()));
      if (match) return match.id;
    }
  }
  return undefined;
}

const schema = z.object({
  type: z.enum(["income", "expense", "transfer"]),
  amount: z.string().min(1, "Informe o valor"),
  description: z.string().min(1, "Informe a descrição"),
  account_id: z.string().min(1, "Selecione a conta"),
  destination_account_id: z.string().optional(),
  category_id: z.string().optional(),
  date: z.string(),
  notes: z.string().optional(),
  is_recurring: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

const TYPE_LABELS = {
  expense: "Gasto",
  income: "Receita",
  transfer: "Transferência",
};

export function TransactionDialog({ open, onClose }: Props) {
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const supabase = createClient();
  const createTx = useCreateTransaction();
  const { data: accounts = [] } = useAccounts();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "expense",
      date: format(new Date(), "yyyy-MM-dd"),
      is_recurring: false,
    },
  });

  const txType = form.watch("type");
  const amountStr = form.watch("amount");
  const descStr = form.watch("description");
  const { data: categories = [] } = useCategories(
    txType === "income" ? "income" : txType === "expense" ? "expense" : undefined
  );

  // Hourly rate from monthly income (220 working hours/month)
  const hourlyRate = monthlyIncome > 0 ? monthlyIncome / 220 : 0;
  const amountNum = parseFloat(amountStr?.replace(/\./g, "").replace(",", ".") || "0");
  const workHours = hourlyRate > 0 && amountNum > 0 ? amountNum / hourlyRate : 0;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      if (data.user) {
        supabase.from("profiles").select("monthly_income").eq("id", data.user.id).single()
          .then(({ data: p }) => setMonthlyIncome(p?.monthly_income ?? 0));
      }
    });
  }, [supabase]);

  // Autocomplete category from description
  useEffect(() => {
    if (!descStr || categories.length === 0) return;
    const detected = detectCategory(descStr, categories);
    if (detected && !form.getValues("category_id")) {
      form.setValue("category_id", detected);
    }
  }, [descStr, categories, form]);

  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

  async function onSubmit(values: FormValues) {
    if (!userId) return;
    const amount = parseFloat(values.amount.replace(/\./g, "").replace(",", "."));
    const transferPairId = values.type === "transfer" && values.destination_account_id
      ? crypto.randomUUID()
      : undefined;

    await createTx.mutateAsync({
      user_id: userId,
      account_id: values.account_id,
      category_id: values.category_id || null,
      type: values.type,
      amount,
      description: values.description,
      notes: values.notes || null,
      date: values.date,
      is_recurring: values.is_recurring ?? false,
      transfer_pair_id: transferPairId ?? null,
    });

    // For transfers: create the income side in destination account
    if (values.type === "transfer" && values.destination_account_id && transferPairId) {
      await createTx.mutateAsync({
        user_id: userId,
        account_id: values.destination_account_id,
        category_id: null,
        type: "income",
        amount,
        description: `Transferência: ${values.description}`,
        date: values.date,
        is_recurring: undefined,
        transfer_pair_id: transferPairId,
      });
    }

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      form.reset({ type: "expense", date: today, is_recurring: false });
      onClose();
    }, 800);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova transação</DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-2 py-8"
            >
              <CheckCircle2 className="w-12 h-12 text-primary" />
              <p className="font-medium text-sm">Transação registrada!</p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Type selector */}
                  <div className="flex gap-1 p-1 bg-muted rounded-lg">
                    {(["expense", "income", "transfer"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => form.setValue("type", t)}
                        className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          txType === t
                            ? t === "expense"
                              ? "bg-rose-500 text-white"
                              : t === "income"
                              ? "bg-emerald-500 text-white"
                              : "bg-blue-500 text-white"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {TYPE_LABELS[t]}
                      </button>
                    ))}
                  </div>

                  {/* Amount + work hours */}
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor (R$)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="0,00"
                            inputMode="decimal"
                            className="text-lg tabular-nums"
                          />
                        </FormControl>
                        {txType === "expense" && workHours > 0 && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {workHours < 1
                              ? `${Math.round(workHours * 60)} min de trabalho`
                              : `${workHours.toFixed(1)}h de trabalho`}
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Supermercado, Salário..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    {/* Account */}
                    <FormField
                      control={form.control}
                      name="account_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conta</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Conta" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {accounts.map((acc) => (
                                <SelectItem key={acc.id} value={acc.id}>
                                  {acc.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Category */}
                    {txType !== "transfer" && (
                      <FormField
                        control={form.control}
                        name="category_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoria</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Categoria" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Date */}
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className={txType === "transfer" ? "col-span-2" : ""}>
                          <FormLabel>Data</FormLabel>
                          <div className="flex gap-1 mb-1">
                            {[
                              { label: "Hoje", value: today },
                              { label: "Ontem", value: yesterday },
                            ].map(({ label, value }) => (
                              <button
                                key={label}
                                type="button"
                                onClick={() => field.onChange(value)}
                                className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                                  field.value === value
                                    ? "border-primary text-primary bg-primary/10"
                                    : "border-border text-muted-foreground hover:border-primary/50"
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Transfer: destination account */}
                    {txType === "transfer" && (
                      <FormField
                        control={form.control}
                        name="destination_account_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Conta destino</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Destino" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {accounts.map((acc) => (
                                  <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  {/* Recurring toggle */}
                  <FormField
                    control={form.control}
                    name="is_recurring"
                    render={({ field }) => (
                      <button
                        type="button"
                        onClick={() => field.onChange(!field.value)}
                        className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-md border transition-colors w-fit ${
                          field.value
                            ? "border-primary text-primary bg-primary/10"
                            : "border-border text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        <RepeatIcon className="w-3.5 h-3.5" />
                        {field.value ? "Recorrente (ativo)" : "Marcar como recorrente"}
                      </button>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createTx.isPending}
                  >
                    {createTx.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Salvar
                  </Button>
                </form>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
