import type { Transaction, Profile } from "@/lib/supabase/types";

export function buildPainPointsPrompt(
  profile: Profile,
  transactions: Transaction[],
  categories: Record<string, string>
): string {
  const enriched = transactions.map((t) => ({
    date: t.date,
    type: t.type,
    amount: t.amount,
    description: t.description,
    category: categories[t.category_id || ""] || "Sem categoria",
  }));

  return `Você é um consultor financeiro pessoal empático e direto.
Analise os dados financeiros abaixo e identifique os 3 principais PONTOS DE DOR financeiros deste usuário — situações concretas onde ele está prejudicando sua saúde financeira, talvez sem perceber.

Para cada ponto de dor, forneça:
- title: título impactante (máx 6 palavras)
- diagnosis: diagnóstico claro e honesto (2-3 frases, sem rodeios)
- annual_impact: impacto calculado em reais por ano (número)
- action: uma ação imediata e concreta para resolver (1-2 frases)
- emoji: emoji relevante

[DADOS DO USUÁRIO]
Renda mensal declarada: R$ ${profile.monthly_income ?? "não informada"}
Meta financeira: ${profile.financial_goal ?? "não definida"}
Nível de estilo de vida: ${profile.lifestyle_level}/5

Transações dos últimos 90 dias:
${JSON.stringify(enriched, null, 2)}

Responda SOMENTE em JSON válido com este schema:
{
  "pain_points": [
    {
      "title": "string",
      "diagnosis": "string",
      "annual_impact": number,
      "action": "string",
      "emoji": "string"
    }
  ]
}`;
}

export function buildMonthlyReportPrompt(
  profile: Profile,
  currentMonth: { income: number; expense: number; savings: number; period: string },
  previousMonth: { income: number; expense: number; savings: number } | null,
  topCategories: Array<{ name: string; amount: number }>,
  savingsGoal: number
): string {
  return `Você é um jornalista financeiro que conhece bem o usuário. Escreva um relatório mensal financeiro em português do Brasil.

Tom: direto, empático, sem enrolação. Como um amigo que entende de finanças.

[DADOS DO MÊS: ${currentMonth.period}]
Receita: R$ ${currentMonth.income.toFixed(2)}
Gastos: R$ ${currentMonth.expense.toFixed(2)}
Poupança: R$ ${currentMonth.savings.toFixed(2)}
Taxa de poupança: ${currentMonth.income > 0 ? ((currentMonth.savings / currentMonth.income) * 100).toFixed(1) : 0}%

${previousMonth ? `[MÊS ANTERIOR]
Receita: R$ ${previousMonth.income.toFixed(2)}
Gastos: R$ ${previousMonth.expense.toFixed(2)}
Poupança: R$ ${previousMonth.savings.toFixed(2)}` : ""}

[TOP CATEGORIAS DE GASTO]
${topCategories.map((c) => `${c.name}: R$ ${c.amount.toFixed(2)}`).join("\n")}

[PERFIL]
Renda mensal declarada: R$ ${profile.monthly_income ?? "não informada"}
Meta financeira: ${profile.financial_goal ?? "não definida"}
Meta de poupança ideal: R$ ${savingsGoal.toFixed(2)}/mês

Responda SOMENTE em JSON válido com este schema:
{
  "headline": "string (frase de impacto sobre o mês)",
  "summary": "string (2-3 frases sobre o mês)",
  "achievements": ["string", "string", "string"],
  "alerts": ["string", "string"],
  "challenge": "string (um desafio para o próximo mês)",
  "score_delta": number (variação estimada no health score, -10 a +10)
}`;
}

export function buildCategorizationPrompt(descriptions: string[]): string {
  return `Você é um sistema de categorização de extratos bancários brasileiros.

Categorize cada descrição abaixo em uma categoria financeira em português do Brasil.

REGRAS OBRIGATÓRIAS:
- Responda SOMENTE com JSON válido, sem markdown, sem texto adicional
- Cada chave é a descrição EXATAMENTE como fornecida (não altere)
- Cada valor: { "categoryName": string, "type": "income"|"expense", "icon": emoji, "color": hex }
- type "income" APENAS para: salário, rendimentos, reembolsos, PIX/TED recebidos
- Para o resto use "expense"
- Categorias sugeridas: Alimentação, Supermercado, Transporte, Saúde, Educação, Moradia, Lazer, Streaming, Seguros, Impostos, Serviços, Compras, Outros

DESCRIÇÕES A CATEGORIZAR:
${descriptions.map((d) => `- "${d}"`).join("\n")}

RESPONDA APENAS COM O JSON:`;
}

export function buildChatSystemPrompt(
  profile: Profile,
  recentTransactions: Transaction[],
  categories: Record<string, string>,
  currentMonthSummary: { income: number; expense: number; savings: number }
): string {
  const txSample = recentTransactions.slice(0, 30).map((t) => ({
    date: t.date,
    type: t.type,
    amount: t.amount,
    description: t.description,
    category: categories[t.category_id || ""] || "Sem categoria",
  }));

  return `Você é o consultor financeiro pessoal do usuário dentro do app "Another Personal Finance App". Você tem acesso aos dados reais dele.

Seu estilo:
- Direto, sem rodeios, sem elogios vazios
- Use dados reais nas respostas
- Sugira ações concretas e numéricas
- Português brasileiro informal mas profissional
- Máximo 3 parágrafos por resposta, a menos que o usuário peça mais detalhes

[PERFIL DO USUÁRIO]
Nome: ${profile.name ?? "Usuário"}
Renda mensal: R$ ${profile.monthly_income ?? "não informada"}
Meta financeira: ${profile.financial_goal ?? "não definida"}
Nível de vida: ${profile.lifestyle_level}/5

[RESUMO DO MÊS ATUAL]
Receita: R$ ${currentMonthSummary.income.toFixed(2)}
Gastos: R$ ${currentMonthSummary.expense.toFixed(2)}
Saldo: R$ ${currentMonthSummary.savings.toFixed(2)}

[ÚLTIMAS TRANSAÇÕES]
${JSON.stringify(txSample, null, 2)}`;
}
