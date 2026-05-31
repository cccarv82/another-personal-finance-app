"use client";

import type { ParsedTransaction } from "@/lib/utils/csv-import";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export interface SuggestedCategory {
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
}

export interface CategorizedTransaction extends ParsedTransaction {
  suggestedCategory?: SuggestedCategory;
  category_id?: string | null;
}

interface Rule {
  pattern: RegExp;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
}

const RULES: Rule[] = [
  // ── Income ─────────────────────────────────────────────────────────────────
  { pattern: /salario|salário|pagto\s*sal|vencimento|folha\s*pag|pagamento\s*func/i,         name: "Salário",               type: "income",  icon: "💰", color: "#10b981" },
  { pattern: /rendimento|rend\s*poup|juros\s*cred|dividendo|jcp|resgate/i,                   name: "Rendimentos",           type: "income",  icon: "📈", color: "#10b981" },
  { pattern: /pix\s+receb|pix\s+transf.*cred|ted.*cred|doc.*cred/i,                          name: "PIX/TED Recebido",      type: "income",  icon: "↙️", color: "#34d399" },
  { pattern: /cashback|reembolso|estorno/i,                                                   name: "Reembolso",             type: "income",  icon: "↩️", color: "#34d399" },

  // ── Fatura cartão (antes de boleto genérico) ────────────────────────────────
  { pattern: /fatura.*cart|pag.*fatura|personnalite|nubank\s*fat|bradesco\s*card/i,           name: "Fatura Cartão",         type: "expense", icon: "💳", color: "#8b5cf6" },

  // ── Boletos ──────────────────────────────────────────────────────────────────
  { pattern: /pag\s*boleto|pagto\s*bol|\bboleto\b/i,                                          name: "Boletos",               type: "expense", icon: "🧾", color: "#6366f1" },

  // ── Delivery ─────────────────────────────────────────────────────────────────
  { pattern: /\bifood\b|rappi|james\s*del|uber\s*eats|go\s*food|loggi|lalamove/i,             name: "Delivery",              type: "expense", icon: "🛵", color: "#ef4444" },

  // ── Transporte por app ────────────────────────────────────────────────────────
  { pattern: /\buber\b|99\s*(app|pop|taxi)|cabify|lyft/i,                                     name: "Transporte",            type: "expense", icon: "🚗", color: "#f59e0b" },

  // ── Streaming ────────────────────────────────────────────────────────────────
  { pattern: /netflix|spotify|deezer|hbo|disney|amazon\s*prime|globoplay|youtube\s*premium|paramount|apple\s*tv|telecine|mubi/i, name: "Streaming", type: "expense", icon: "📺", color: "#7c3aed" },

  // ── Supermercado ──────────────────────────────────────────────────────────────
  { pattern: /supermercado|carrefour|\bextra\s|wal.?mart|pao\s*de\s*acucar|atacadao|assai|bistek|sonda|zaffari|hortifruti|coop\s*super/i, name: "Supermercado", type: "expense", icon: "🛒", color: "#10b981" },

  // ── Restaurante ───────────────────────────────────────────────────────────────
  { pattern: /restaurante|lanchonete|pizzaria|burger\s*king|mc\s*donald|bob.*burger|subway|madero|outback|coco\s*bambu|churrascaria|sushi|japon/i, name: "Restaurantes", type: "expense", icon: "🍽️", color: "#f97316" },

  // ── Padaria / café ────────────────────────────────────────────────────────────
  { pattern: /padaria|panificadora|banca\s*de\s*rev|cafeteria|starbucks/i,                    name: "Alimentação",           type: "expense", icon: "🍞", color: "#f97316" },

  // ── Farmácia ──────────────────────────────────────────────────────────────────
  { pattern: /farmacia|farmácia|drogaria|drogasil|droga\s*raia|ultrafarma|pacheco|panvel|nissei|pague\s*menos/i, name: "Farmácia", type: "expense", icon: "💊", color: "#06b6d4" },

  // ── Saúde ─────────────────────────────────────────────────────────────────────
  { pattern: /clinica|clínica|hospital|laboratorio|laborat|exame|unimed|hapvida|amil|sulamerica\s*saude|bradesco\s*saude|plano\s*saude|odonto/i, name: "Saúde", type: "expense", icon: "🏥", color: "#06b6d4" },

  // ── Energia elétrica ──────────────────────────────────────────────────────────
  { pattern: /energia|eletropaulo|cemig|copel|light\s+s|enel|cpfl|celesc|coelba|elektro|equatorial/i, name: "Energia Elétrica", type: "expense", icon: "⚡", color: "#f59e0b" },

  // ── Água ──────────────────────────────────────────────────────────────────────
  { pattern: /\b(sabesp|sanepar|embasa|cagece|copasa|cedae|caern|casan)\b/i,                  name: "Água/Saneamento",       type: "expense", icon: "💧", color: "#0ea5e9" },

  // ── Internet / TV ─────────────────────────────────────────────────────────────
  { pattern: /internet|fibra|net\s*combo|claro\s*net|oi\s*fibra|vivo\s*fix|sky\s*band/i,      name: "Internet/TV",           type: "expense", icon: "📡", color: "#6366f1" },

  // ── Celular ───────────────────────────────────────────────────────────────────
  { pattern: /\b(tim|vivo|claro|oi)\s*(movel|móvel|cel|\d{2,})/i,                             name: "Celular",               type: "expense", icon: "📱", color: "#8b5cf6" },

  // ── Combustível ───────────────────────────────────────────────────────────────
  { pattern: /posto\s|combustivel|combustível|gasolina|etanol|\bdiesel\b|ipiranga|shell|br\s*dist/i, name: "Combustível", type: "expense", icon: "⛽", color: "#f59e0b" },

  // ── Aluguel ───────────────────────────────────────────────────────────────────
  { pattern: /aluguel|locação|locacao|imobiliaria|imobiliária/i,                               name: "Aluguel",               type: "expense", icon: "🏠", color: "#f97316" },

  // ── Condomínio ────────────────────────────────────────────────────────────────
  { pattern: /condominio|condomínio|cond\s+(res|edif|club)/i,                                 name: "Condomínio",            type: "expense", icon: "🏢", color: "#f97316" },

  // ── Educação ──────────────────────────────────────────────────────────────────
  { pattern: /escola|faculdade|universidade|ensino|colegio|colégio|\bcurso\b|unificado/i,      name: "Educação",              type: "expense", icon: "📚", color: "#6366f1" },

  // ── Seguros ───────────────────────────────────────────────────────────────────
  { pattern: /seguro\s*(auto|vida|resid|cart)|seg\s+(auto|vida|prot|cart)|porto\s*seguro|itau\s*seg/i, name: "Seguros", type: "expense", icon: "🛡️", color: "#64748b" },

  // ── Academia ──────────────────────────────────────────────────────────────────
  { pattern: /academia|smartfit|bodytech|bio\s*ritmo|crossfit/i,                               name: "Academia",              type: "expense", icon: "🏋️", color: "#ec4899" },

  // ── Impostos ──────────────────────────────────────────────────────────────────
  { pattern: /\b(iptu|ipva|inss|fgts|darf|ir\s*fonte|receita\s*fed)\b/i,                      name: "Impostos/Taxas",        type: "expense", icon: "🏛️", color: "#64748b" },

  // ── Capitalização ─────────────────────────────────────────────────────────────
  { pattern: /cap\s+multisorte|capitalizacao|capitalização|titulo\s*cap/i,                    name: "Capitalização",         type: "expense", icon: "🎯", color: "#64748b" },

  // ── Transferências saída ──────────────────────────────────────────────────────
  { pattern: /pix\s+transf|^ted\s+\d|^doc\s+\d/i,                                            name: "Transferências",        type: "expense", icon: "↗️", color: "#94a3b8" },

  // ── PIX QRS / RSCSS (débito via QR Code ou rotativo sem senha) ────────────────
  { pattern: /pix\s+qrs|rscss/i,                                                              name: "Compras",               type: "expense", icon: "🛍️", color: "#94a3b8" },

  // ── Débito automático ─────────────────────────────────────────────────────────
  { pattern: /^da\s+[a-z]/i,                                                                   name: "Débito Automático",     type: "expense", icon: "🔄", color: "#64748b" },
];

export function applyKeywordRules(txs: ParsedTransaction[]): {
  matched: CategorizedTransaction[];
  unmatched: ParsedTransaction[];
} {
  const matched: CategorizedTransaction[] = [];
  const unmatched: ParsedTransaction[] = [];

  for (const tx of txs) {
    let found: SuggestedCategory | undefined;
    for (const rule of RULES) {
      if (rule.pattern.test(tx.description)) {
        found = { name: rule.name, type: rule.type, icon: rule.icon, color: rule.color };
        break;
      }
    }
    if (found) matched.push({ ...tx, suggestedCategory: found });
    else unmatched.push(tx);
  }

  return { matched, unmatched };
}

export async function categorizeTransactions(txs: ParsedTransaction[]): Promise<CategorizedTransaction[]> {
  const { matched, unmatched } = applyKeywordRules(txs);

  if (unmatched.length === 0) return matched;

  const descriptions = [...new Set(unmatched.map((t) => t.description))];
  const aiResults: Record<string, SuggestedCategory> = {};

  try {
    for (let i = 0; i < descriptions.length; i += 50) {
      const chunk = descriptions.slice(i, i + 50);
      const res = await fetch("/api/ai/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descriptions: chunk }),
      });
      if (res.ok) {
        const data = await res.json() as Record<string, Record<string, string>>;
        // Normalize: AI may return `categoryName` instead of `name`
        for (const [desc, raw] of Object.entries(data)) {
          aiResults[desc] = {
            name: raw.name ?? raw.categoryName ?? "Outros",
            type: raw.type === "income" ? "income" : "expense",
            icon: raw.icon ?? "📌",
            color: raw.color ?? "#94a3b8",
          };
        }
      }
    }
  } catch {
    // AI fallback failed — continue without category
  }

  const unmatchedCategorized = unmatched.map((tx) => ({
    ...tx,
    suggestedCategory: aiResults[tx.description],
  }));

  return [...matched, ...unmatchedCategorized];
}

type TxWithDbId = ParsedTransaction & { _dbId: string };

export async function categorizeExistingTransactions(
  supabase: SupabaseClient<Database>,
  userId: string,
  onProgress?: (done: number, total: number) => void
): Promise<number> {
  const { data: txs, error: fetchError } = await supabase
    .from("transactions")
    .select("id, description, type, amount, date")
    .eq("user_id", userId)
    .is("category_id", null)
    .in("type", ["income", "expense"]);

  if (fetchError) throw fetchError;
  if (!txs?.length) return 0;

  // Map to ParsedTransaction format, carrying the DB id as _dbId
  const parsed: TxWithDbId[] = txs.map((t) => ({
    date: t.date,
    description: t.description,
    amount: t.amount,
    type: t.type as "income" | "expense",
    bank: "",
    _dbId: t.id,
  }));

  // _dbId is preserved through spread in categorizeTransactions + resolveOrCreateCategories
  const categorized = await categorizeTransactions(parsed);
  const withCategoryIds = await resolveOrCreateCategories(
    categorized as CategorizedTransaction[],
    supabase,
    userId
  );

  // Group DB transaction ids by their resolved category_id
  const byCategory: Record<string, string[]> = {};
  for (const tx of withCategoryIds) {
    const dbId = (tx as unknown as TxWithDbId)._dbId;
    if (tx.category_id && dbId) {
      if (!byCategory[tx.category_id]) byCategory[tx.category_id] = [];
      byCategory[tx.category_id].push(dbId);
    }
  }

  let updated = 0;
  const entries = Object.entries(byCategory);
  for (let i = 0; i < entries.length; i++) {
    const [catId, ids] = entries[i];
    const { error } = await supabase
      .from("transactions")
      .update({ category_id: catId })
      .in("id", ids);
    if (!error) updated += ids.length;
    onProgress?.(i + 1, entries.length);
  }

  return updated;
}

export async function resolveOrCreateCategories(
  txs: CategorizedTransaction[],
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<CategorizedTransaction[]> {
  const { data: existing } = await supabase
    .from("categories")
    .select("id, name, type")
    .eq("user_id", userId);

  const catMap: Record<string, string> = {};
  (existing ?? []).forEach((c) => { catMap[c.name.toLowerCase()] = c.id; });

  const result: CategorizedTransaction[] = [];

  for (const tx of txs) {
    if (!tx.suggestedCategory) {
      result.push({ ...tx, category_id: null });
      continue;
    }

    const key = tx.suggestedCategory.name.toLowerCase();
    if (catMap[key]) {
      result.push({ ...tx, category_id: catMap[key] });
    } else {
      const { data: newCat } = await supabase
        .from("categories")
        .insert({
          user_id: userId,
          name: tx.suggestedCategory.name,
          type: tx.suggestedCategory.type,
          icon: tx.suggestedCategory.icon,
          color: tx.suggestedCategory.color,
          is_system: false,
        })
        .select("id")
        .single();

      if (newCat) {
        catMap[key] = newCat.id;
        result.push({ ...tx, category_id: newCat.id });
      } else {
        result.push({ ...tx, category_id: null });
      }
    }
  }

  return result;
}
