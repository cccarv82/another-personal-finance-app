"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Category, Inserts } from "@/lib/supabase/types";
import { toast } from "sonner";

const QUERY_KEY = "categories";

export function useCategories(type?: "income" | "expense") {
  const supabase = createClient();

  return useQuery({
    queryKey: [QUERY_KEY, type],
    queryFn: async () => {
      let query = supabase.from("categories").select("*").order("name");
      if (type) query = query.eq("type", type);
      const { data, error } = await query;
      if (error) throw error;
      return data as Category[];
    },
  });
}

export function useCategoryMap() {
  const { data } = useCategories();
  const map: Record<string, string> = {};
  (data ?? []).forEach((c) => { map[c.id] = c.name; });
  return map;
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (data: Omit<Inserts<"categories">, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");
      const { data: result, error } = await supabase
        .from("categories")
        .insert({ ...data, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Categoria criada");
    },
    onError: (err) => {
      toast.error("Erro ao criar categoria: " + err.message);
    },
  });
}
