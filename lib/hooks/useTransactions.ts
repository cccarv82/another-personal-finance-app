"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Transaction, Inserts, Updates } from "@/lib/supabase/types";
import { toast } from "sonner";

const QUERY_KEY = "transactions";

export function useTransactions(filters?: {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  accountId?: string;
  type?: string;
  search?: string;
  limit?: number;
}) {
  const supabase = createClient();

  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from("transactions")
        .select("*, categories(name, color, icon), accounts(name, color)")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (filters?.startDate) query = query.gte("date", filters.startDate);
      if (filters?.endDate) query = query.lte("date", filters.endDate);
      if (filters?.categoryId) query = query.eq("category_id", filters.categoryId);
      if (filters?.accountId) query = query.eq("account_id", filters.accountId);
      if (filters?.type) query = query.eq("type", filters.type as import("@/lib/supabase/types").TransactionType);
      if (filters?.search) query = query.ilike("description", `%${filters.search}%`);
      if (filters?.limit) query = query.limit(filters.limit);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as (Transaction & {
        categories: { name: string; color: string | null; icon: string | null } | null;
        accounts: { name: string; color: string | null } | null;
      })[];
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (data: Inserts<"transactions">) => {
      const { data: result, error } = await supabase
        .from("transactions")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Transação registrada");
    },
    onError: (err) => {
      toast.error("Erro ao salvar transação: " + err.message);
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Updates<"transactions"> }) => {
      const { data: result, error } = await supabase
        .from("transactions")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Transação atualizada");
    },
    onError: (err) => {
      toast.error("Erro ao atualizar: " + err.message);
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Transação removida");
    },
    onError: (err) => {
      toast.error("Erro ao remover: " + err.message);
    },
  });
}
