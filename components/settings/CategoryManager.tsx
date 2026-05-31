"use client";

import { useState } from "react";
import { useCategories, useCreateCategory } from "@/lib/hooks/useCategories";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Tag } from "lucide-react";

const CATEGORY_COLORS = ["#00D4AA","#6C8EFF","#A78BFA","#F59E0B","#FF4D6A","#34D399","#60A5FA","#FB923C","#F472B6"];
const CATEGORY_ICONS = ["🏠","🍽️","🚗","💊","📚","🎮","👕","📱","🛒","🛵","💼","💻","📈","💰","✈️","🏋️","🎵","☕","🐾","💸"];

export function CategoryManager() {
  const [name, setName] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [color, setColor] = useState(CATEGORY_COLORS[0]);
  const [icon, setIcon] = useState("💸");
  const [tab, setTab] = useState<"expense" | "income">("expense");

  const { data: categories = [] } = useCategories(tab);
  const createCat = useCreateCategory();
  const queryClient = useQueryClient();
  const supabase = createClient();

  const deleteCat = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria removida");
    },
  });

  async function handleAdd() {
    if (!name.trim()) return;
    await createCat.mutateAsync({ name: name.trim(), type, icon, color });
    setName("");
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Tag className="w-4 h-4 text-amber-400" />
          Gerenciar Categorias
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
          {(["expense","income"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${tab === t ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
              {t === "expense" ? "Gastos" : "Receitas"}
            </button>
          ))}
        </div>

        {/* Existing */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center gap-1 bg-muted rounded-md px-2 py-1 text-xs group">
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
              {!cat.is_system && (
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteCat.mutate(cat.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
              {cat.is_system && <Badge variant="outline" className="text-[9px] h-3.5 px-1 ml-1">padrão</Badge>}
            </div>
          ))}
        </div>

        {/* Add new */}
        <div className="border-t border-border pt-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Nova categoria</p>
          <div className="grid grid-cols-2 gap-2">
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nome" className="h-8 text-xs" />
            <Select value={type} onValueChange={(v) => v && setType(v as "expense" | "income")}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Gasto</SelectItem>
                <SelectItem value="income">Receita</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-wrap gap-1">
              {CATEGORY_ICONS.slice(0,10).map(ic => (
                <button key={ic} onClick={() => setIcon(ic)}
                  className={`text-sm p-1 rounded transition-all ${icon === ic ? "bg-primary/20 scale-110" : "hover:bg-muted"}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORY_COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                className={`w-5 h-5 rounded-full transition-all ${color === c ? "ring-2 ring-offset-1 ring-offset-card ring-white scale-110" : ""}`}
                style={{ background: c }} />
            ))}
          </div>
          <Button size="sm" className="w-full gap-1.5 text-xs" onClick={handleAdd} disabled={!name || createCat.isPending}>
            <Plus className="w-3.5 h-3.5" /> Adicionar categoria
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
