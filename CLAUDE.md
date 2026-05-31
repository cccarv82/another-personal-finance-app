@AGENTS.md

# Another Personal Finance App — Project Guide

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16.2.6, App Router, **webpack** (not Turbopack — server-only env vars broken in Turbopack dev) |
| UI | React 19, Tailwind v4, shadcn/Radix UI, Framer Motion, Recharts |
| DB / Auth | Supabase (Postgres + RLS + Realtime) |
| Data fetching | TanStack React Query v5 |
| AI | Anthropic SDK (`claude-sonnet-4-6`) |
| Language | TypeScript 5, strict |

## Running locally

```bash
npm run dev   # starts with --webpack flag (required — see Known Issues)
```

Server reads `.env.local`. If `ANTHROPIC_API_KEY` is also set as a **Windows system env var**, Windows takes priority over `.env.local`. Either remove the system var or run: `ANTHROPIC_API_KEY=<key> npm run dev`.

## Architecture

### Route groups
- `app/(auth)/` — login + OAuth callback, no auth guard
- `app/(app)/` — protected app, layout checks `supabase.auth.getUser()` and redirects to `/login`

### Database tables
| Table | Purpose |
|---|---|
| `profiles` | User settings: name, currency, monthly_income, financial_goal, lifestyle_level |
| `accounts` | Bank/wallet accounts with balance, type, color |
| `categories` | Income/expense categories, per-user, with icon/color |
| `transactions` | Core: income/expense/transfer, linked to account + category |
| `financial_goals` | Savings goals with target/current amount |
| `ai_insights` | Cached AI responses (pain_points, monthly_report) — 7 day TTL |
| `ai_conversations` | Chat history |

### Data flow
- Server Components fetch data at render time (dashboard page uses most-recent-month fallback)
- Client Components use React Query hooks (`lib/hooks/`)
- Supabase Realtime subscribes to `transactions` + `accounts` changes → invalidates queries automatically (`RealtimeProvider`)

### AI routes
All under `app/api/ai/`, all `runtime = "nodejs"`:
- `POST /api/ai/chat` — streaming SSE chat, context = profile + last 50 txs
- `POST /api/ai/insights` — pain points (cached 7d), accepts `force: true` to bypass cache
- `POST /api/ai/report` — monthly report (cached per period)
- `POST /api/ai/categorize` — batch categorize transaction descriptions, returns `{ description: { name, type, icon, color } }`

### Auto-categorization pipeline (`lib/ai/categorize.ts`)
Two-stage, runs on CSV import and via "✨ Auto-categorizar" button:
1. **Keyword rules** — 40+ regex patterns for Brazilian bank transactions (PAG BOLETO, FATURA, UBER, IFOOD, RSCSS, PIX QRS, streaming, supermercados, farmácias, etc.)
2. **AI fallback** — descriptions not matched by rules go to Claude in batches of 50

Categories are auto-created in Supabase if they don't exist.

## Key files

```
lib/
  ai/
    categorize.ts      — keyword rules + AI batch + resolveOrCreateCategories
    health-score.ts    — local score calculation (no AI)
    prompts.ts         — all AI prompts in PT-BR
  hooks/
    useTransactions.ts — CRUD + bulk delete + Realtime subscription
    useAccounts.ts
    useCategories.ts
  supabase/
    client.ts          — browser Supabase client
    server.ts          — server Supabase client
    middleware.ts      — session refresh (used by proxy.ts)
    types.ts           — full DB type schema
  utils/
    csv-import.ts      — bank CSV parsers (Nubank, Itaú, Bradesco, Inter, C6, generic)
    dates.ts           — date utils, getMonthRange (timezone-safe)
    currency.ts        — formatCurrency BRL

proxy.ts               — Next.js 16 proxy (was middleware.ts), handles Supabase session
```

## CSV Import

Supported formats: Nubank, Itaú, Bradesco, Inter, C6, generic (auto-detect).

Auto-detect logic in `parseGenericCSV`:
- If first line starts with `DD/MM/YYYY` → no header, process all lines
- Keywords in first line route to bank-specific parser
- Generic fallback: `date;description;amount` with negative = expense

After parsing, categorization runs automatically before showing the preview.

## Known Issues / Quirks

1. **Turbopack + server-only env vars**: `process.env.ANTHROPIC_API_KEY` is `undefined` in route handlers when running with Turbopack. Fixed by `--webpack` flag in `dev` script.

2. **Windows system env override**: If `ANTHROPIC_API_KEY` exists as a Windows user/system environment variable, it overrides `.env.local`. Remove it from system env or pass it inline.

3. **Hydration mismatch on ThemeToggle**: Known issue with `next-themes` + SSR. Benign — React recovers client-side.

4. **Dashboard period**: Server component fetches the most-recent month with data (not always current month). If current month has data, shows current month. Falls back to last month with transactions.

5. **getMonthRange timezone**: Fixed — parses `period` string manually to avoid `new Date("YYYY-MM-DD")` UTC shift bug (would show wrong month for UTC-3 users).

## Health Score

Calculated locally in `lib/ai/health-score.ts`, no AI call:
- Savings rate: 30%
- Spending control (variance): 25%
- Diversification (no single category > 40%): 20%
- Goal progress: 15%
- Income stability: 10%

Labels: crítico (<30), alerta (<50), regular (<65), bom (<80), excelente (≥80)

## Model

Always use `claude-sonnet-4-6`. The old `claude-sonnet-4-20250514` is deprecated (EoL June 15, 2026).

When parsing AI JSON responses, always strip markdown code fences:
```typescript
if (rawText.startsWith("```")) {
  rawText = rawText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
}
```
