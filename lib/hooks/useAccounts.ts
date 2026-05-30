"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Account, Inserts, Updates } from "@/lib/supabase/types";
import { toast } from "sonner";

const QUERY_KEY = "accounts";

export function useAccounts() {
  const supabase = createClient();

  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as Account[];
    },
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (data: Omit<Inserts<"accounts">, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");
      const { data: result, error } = await supabase
        .from("accounts")
        .insert({ ...data, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Conta criada");
    },
    onError: (err) => {
      toast.error("Erro ao criar conta: " + err.message);
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Updates<"accounts"> }) => {
      const { data: result, error } = await supabase
        .from("accounts")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Conta atualizada");
    },
    onError: (err) => {
      toast.error("Erro ao atualizar conta: " + err.message);
    },
  });
}

export function useTotalNetWorth() {
  const { data: accounts } = useAccounts();
  const total = (accounts ?? [])
    .filter((a) => a.include_in_net_worth)
    .reduce((sum, a) => sum + a.balance, 0);
  return total;
}
