# Another Personal Finance App

> Finanças pessoais com IA de verdade. Não te mostra só que você está fodido — te explica por que e te dá um plano pra sair disso.

## Stack

- **Next.js 15** App Router + TypeScript strict
- **Supabase** — PostgreSQL, Auth (magic link + Google), RLS completo
- **Anthropic Claude** (`claude-sonnet-4-20250514`) — análise, chat streaming, relatórios
- **Tailwind CSS v4** + shadcn/ui + Framer Motion
- **Recharts** para gráficos
- **TanStack Query v5** para server state
- **Vercel** para deploy

## Setup em 5 comandos

```bash
git clone https://github.com/cccarv82/another-personal-finance-app
cd another-personal-finance-app
npm install
cp .env.example .env.local   # preencha as variáveis
npm run dev
```

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon pública |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service role (server only) |
| `ANTHROPIC_API_KEY` | Chave Anthropic (**nunca exposta no cliente**) |
| `NEXT_PUBLIC_APP_URL` | URL base (ex: http://localhost:3000) |

## Banco de dados

No Supabase Dashboard > SQL Editor, execute:

```
supabase/migrations/001_initial_schema.sql
```

## Features

| Feature | Descrição |
|---|---|
| **Financial Health Score** | Score 0-100 calculado localmente, com anel animado e breakdown |
| **Pain Point Detection** | IA detecta os 3 maiores pontos de dor financeiros (cache 7 dias) |
| **AI Chat Advisor** | Chat com streaming SSE, contexto real das finanças do usuário |
| **Monthly Report** | Relatório narrativo mensal: conquistas, alertas, desafio |
| **Transactions** | CRUD completo, categorização, filtros, delete inline |
| **Goals** | Metas com progress bar, confetti ao concluir |
| **Accounts** | Multi-conta: corrente, poupança, investimentos, cartão, cash |
| **Reports** | Bar/line/pie charts de 6 meses |
| **Dark mode** | Padrão dark, light mode via next-themes |
| **Magic link auth** | Sem senha — acesso via link no email ou Google OAuth |

## Segurança

A `ANTHROPIC_API_KEY` **nunca** vai ao browser. Todas as chamadas de IA passam por API routes server-side. RLS habilitado em todas as tabelas do Supabase — cada usuário só acessa seus próprios dados.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
