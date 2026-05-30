"use client";

import { useEffect } from "react";
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
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const schema = z.object({
  type: z.enum(["income", "expense", "transfer"]),
  amount: z.string().min(1, "Informe o valor"),
  description: z.string().min(1, "Informe a descrição"),
  account_id: z.string().min(1, "Selecione a conta"),
  category_id: z.string().optional(),
  date: z.string(),
  notes: z.string().optional(),
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
  const supabase = createClient();
  const createTx = useCreateTransaction();
  const { data: accounts = [] } = useAccounts();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "expense",
      date: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const txType = form.watch("type");
  const { data: categories = [] } = useCategories(
    txType === "income" ? "income" : txType === "expense" ? "expense" : undefined
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, [supabase.auth]);

  async function onSubmit(values: FormValues) {
    if (!userId) return;
    const amount = parseFloat(values.amount.replace(/\./g, "").replace(",", "."));
    await createTx.mutateAsync({
      user_id: userId,
      account_id: values.account_id,
      category_id: values.category_id || null,
      type: values.type,
      amount,
      description: values.description,
      notes: values.notes || null,
      date: values.date,
    });
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      form.reset({ type: "expense", date: format(new Date(), "yyyy-MM-dd") });
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

                  {/* Amount */}
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
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
