# Design System — Retro-Modern Dark

> Estética Bauhaus × Memphis × Swiss International Style, reinterpretada com técnica contemporânea.
> "Um designer cult de Milão construiu isso em 2025."

---

## 1. Filosofia

| Princípio | Aplicação |
|---|---|
| **Zero arredondamento** | `border-radius: 0` em tudo. Exceção: avatars/pills = `9999px` |
| **Contraste tipográfico brutal** | Mistura tamanhos extremos: headline 100px + label 10px na mesma seção |
| **Espaço negativo intencional** | Não preencha todo o espaço. Vazio é design |
| **Cor como pontuação** | Amarelo mostarda só em pontos de destaque real, não decorativo |
| **Monospace como elemento editorial** | Space Mono para labels, numeração, tags — nunca para corpo |
| **Bordas visíveis, não sombras** | `border: 1px solid var(--border)` em vez de `box-shadow` |

---

## 2. Paleta de Cores

### Modo escuro (padrão)

| Token | OKLCH | Hex aproximado | Uso |
|---|---|---|---|
| `--background` | `oklch(0.082 0.008 65)` | `#0D0B08` | Fundo geral — preto quente, não puro |
| `--foreground` | `oklch(0.962 0.008 75)` | `#F5F0E8` | Texto principal — off-white quente |
| `--card` | `oklch(0.108 0.010 65)` | `#141108` | Cards, painéis |
| `--card-foreground` | igual foreground | — | Texto em cards |
| `--popover` | `oklch(0.130 0.010 65)` | `#1A1610` | Dropdowns, tooltips |
| `--primary` | `oklch(0.720 0.128 78)` | `#C8A431` | **Amarelo mostarda** — CTA, active, accent |
| `--primary-foreground` | `oklch(0.082 0.008 65)` | `#0D0B08` | Texto sobre primary |
| `--muted` | `oklch(0.145 0.010 65)` | `#1C1810` | Backgrounds secundários |
| `--muted-foreground` | `oklch(0.500 0.015 70)` | `#7A7060` | Texto de suporte, placeholders |
| `--border` | `oklch(0.200 0.012 65)` | `#231F15` | Bordas — quente, não cinza puro |
| `--destructive` | `oklch(0.570 0.200 25)` | `#D93025` | Vermelho — erros, delete |
| `--sidebar` | `oklch(0.092 0.010 65)` | `#111009` | Sidebar ligeiramente mais clara que bg |

### Modo claro

| Token | OKLCH | Hex aproximado | Uso |
|---|---|---|---|
| `--background` | `oklch(0.962 0.008 75)` | `#F5F0E8` | Off-white quente — nunca branco puro |
| `--foreground` | `oklch(0.092 0.008 65)` | `#0D0B09` | Texto principal |
| `--card` | `oklch(0.938 0.010 75)` | `#EDE8DC` | Cards — creme levemente mais escuro |
| `--border` | `oklch(0.860 0.012 75)` | `#DDD8CC` | Bordas quentes |
| `--primary` | igual dark | `#C8A431` | Mesmo mustard nos dois modos |

### Cores de gráficos (retro saturadas)

```css
--chart-1: oklch(0.720 0.128 78);  /* mustard   #C8A431 */
--chart-2: oklch(0.570 0.200 25);  /* red       #D93025 */
--chart-3: oklch(0.640 0.130 145); /* green     #4D9B6A */
--chart-4: oklch(0.650 0.115 195); /* teal      #3D8F9B */
--chart-5: oklch(0.680 0.160 55);  /* amber     #C88A1F */
```

### Paleta semântica rápida

```
Positivo / receita  → oklch(0.640 0.130 145)  verde quente
Negativo / gasto    → oklch(0.570 0.200 25)   vermelho
Neutro / transferência → oklch(0.650 0.115 195) teal
Destaque / primário → oklch(0.720 0.128 78)   mostarda
```

---

## 3. Tipografia

### Fontes

| Fonte | Pesos usados | Uso | Import |
|---|---|---|---|
| **Poppins** | 400, 500, 600, 700, 900 | Todo o app — corpo, headings, botões | Google Fonts |
| **Space Mono** | 400, 700 | Labels editoriais, numeração de seções, monospace UI | Google Fonts |

### Como importar (Next.js)

```typescript
import { Poppins, Space_Mono } from "next/font/google";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

// Em <html className={`${poppins.variable} ${spaceMono.variable}`}>
```

### Como importar (HTML/CSS puro)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
```

### Escala tipográfica

| Nome | Tamanho | Peso | Letter-spacing | Uso |
|---|---|---|---|---|
| Display | `clamp(72px, 10vw, 148px)` | 900 | `-0.04em` | Hero headlines |
| H1 | `clamp(48px, 6vw, 96px)` | 900 | `-0.03em` | Títulos de seção |
| H2 | `clamp(32px, 4vw, 64px)` | 700–900 | `-0.025em` | Sub-títulos |
| H3 | `20–28px` | 700 | `-0.02em` | Card titles |
| Body | `14–16px` | 400 | `0` | Texto corrido |
| Small | `12–13px` | 400 | `0` | Metadados |
| Label editorial | `10–11px` | 400 (Space Mono) | `0.12–0.16em` | Numeração, tags de seção |
| Button | `11–13px` | 700 | `0.06–0.1em` | uppercase sempre |

### Regras tipográficas

```css
/* Headings — tracking negativo sempre */
h1, h2, h3, h4, h5, h6 {
  font-weight: 700;
  letter-spacing: -0.025em;
}

/* Labels editoriais — monospace + uppercase + tracking largo */
.label-editorial {
  font-family: var(--font-space-mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.35;
}

/* Numeração de seção (01, 02, 03...) */
.section-num {
  font-family: var(--font-space-mono);
  font-size: 10–11px;
  letter-spacing: 0.14em;
  opacity: 0.35;
}
```

---

## 4. Border Radius — Zero

**Regra absoluta: `border-radius: 0` em tudo.**

```css
/* globals.css */
* {
  border-radius: 0 !important;
}

/* Única exceção: elementos que precisam ser circulares */
.rounded-full { border-radius: 9999px !important; }
/* → avatars, badges circulares, indicadores de status */
```

Em Tailwind, remova qualquer `rounded-*` dos componentes. Nunca `rounded-md`, `rounded-lg`, `rounded-xl` em botões, cards, inputs, modais.

---

## 5. Componentes UI

### Botões

```
REGRAS:
- Sem border-radius
- Texto UPPERCASE sempre
- Font: Poppins 700
- Letter-spacing: 0.06–0.1em
- Sem box-shadow genérico
- Hover: fill sólido ou inversão de cor
```

```css
/* Fill (primário) */
.btn-fill {
  background: var(--primary);
  color: var(--primary-foreground);
  border: 2px solid var(--primary);
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 10–14px 24–40px;
  border-radius: 0;
  transition: background 0.2s, border-color 0.2s;
}
.btn-fill:hover {
  background: oklch(0.640 0.130 145); /* verde */
  border-color: oklch(0.640 0.130 145);
}

/* Outline */
.btn-outline {
  background: transparent;
  border: 2px solid var(--border);
  color: var(--foreground);
}
.btn-outline:hover {
  border-color: var(--primary);
  color: var(--primary);
}

/* Ghost */
.btn-ghost {
  background: transparent;
  border: none;
  color: var(--muted-foreground);
}
.btn-ghost:hover {
  background: var(--muted);
  color: var(--foreground);
}
```

### Cards

```
REGRAS:
- Border-radius: 0
- Border: 1px solid var(--border) — fina, visível
- Background: var(--card) — levemente diferente do bg
- Sem box-shadow
- Opcional: border-top: 2px solid var(--primary) para destaque
```

```html
<!-- Card padrão -->
<div class="border border-border bg-card p-6">
  ...
</div>

<!-- Card com accent top -->
<div class="border border-border bg-card p-6 border-t-2 border-t-primary">
  ...
</div>
```

### Inputs

```
REGRAS:
- Border-radius: 0
- Border: 1.5–2px solid var(--border)
- Focus: border-color → var(--primary)
- Font: Poppins 400
- Label: Space Mono 10px uppercase tracking-widest
```

```html
<div>
  <label class="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
    Email
  </label>
  <input class="w-full border-2 border-border bg-background px-3 py-2.5 text-sm
                focus:border-primary focus:outline-none transition-colors" />
</div>
```

### Badges / Tags

```css
/* Tag editorial */
.tag {
  font-family: var(--font-space-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.55;
}

/* Badge colorido */
.badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border: 1px solid currentColor;
  border-radius: 0;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
```

---

## 6. Layout & Grid

### App Shell (sidebar + content)

```
┌─────────┬──────────────────────────────┐
│         │ HEADER (h-14, sticky)        │
│ SIDEBAR │──────────────────────────────│
│ (w-56)  │                              │
│         │ CONTENT (flex-1, scroll)     │
│         │                              │
└─────────┴──────────────────────────────┘
```

```css
/* Shell */
.app-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  width: 224px; /* 14rem */
  flex-shrink: 0;
  border-right: 1px solid var(--border);
  background: var(--sidebar);
  display: flex;
  flex-direction: column;
}

/* Content area */
.content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Main scroll */
main {
  flex: 1;
  overflow-y: auto;
  padding: 24–32px;
}
```

### Sidebar — Anatomia

```
┌──────────────────────┐
│  ◆ FINAPP            │  ← Logo: ícone losango + texto bold uppercase
├──────────────────────┤
│  01  📊  Dashboard   │  ← Item: número editorial + ícone + label
│  02  ↔  Transações   │  ← Active: barra vertical 2px primária na esquerda
│  03  💳  Contas      │      + fundo primary/10
│  04  🎯  Metas       │
│  05  🤖  IA          │
│  06  📈  Relatórios  │
├──────────────────────┤
│  07  ⚙️  Config      │  ← Separado por border-top
└──────────────────────┘
```

```typescript
// Pattern de item ativo
const active = pathname === href || (href !== "/" && pathname.startsWith(href));

// Classes do item
cn(
  "relative flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
  active
    ? "bg-primary/10 text-foreground font-semibold"
    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
)

// Indicador ativo
{active && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />}
```

### Header — Anatomia

```
┌─────────────────────────────────────────────────────┐
│ [LABEL DA PÁGINA em monospace]    [🔍] [IA] [☀️] [+] [U] │
└─────────────────────────────────────────────────────┘
```

```typescript
// Label da página atual
const PAGE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/transactions": "Transações",
  // ...
};
// Exibir: font-mono text-[10px] tracking-widest uppercase text-muted-foreground/50
```

---

## 7. Padrões Visuais Retro

### Numeração editorial de seções

Use em qualquer página com múltiplas seções:

```html
<div class="flex items-start gap-6">
  <span class="font-mono text-[10px] tracking-widest opacity-35 mt-1">01</span>
  <h2 class="font-black text-5xl tracking-tighter">Título da Seção</h2>
</div>
```

### Ícone-logo losango

```html
<!-- Diamante em CSS puro — sem SVG necessário -->
<div
  class="w-5 h-5 bg-primary"
  style="clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"
/>
```

### Textura de grão

Adicionar sobre qualquer seção de fundo liso:

```html
<div class="relative">
  <!-- Grain overlay -->
  <div
    class="absolute inset-0 pointer-events-none opacity-[0.04]"
    style="
      background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\");
      background-size: 200px 200px;
    "
  />
  <!-- Conteúdo -->
</div>
```

### Headline com texto outline (contorno vazio)

```css
.headline-outlined {
  color: transparent;
  -webkit-text-stroke: 2–3px var(--foreground);
  /* Efeito: texto vazio com contorno visível */
}

/* Sombra offset em cor (substitui box-shadow genérico) */
.headline-shadow {
  position: relative;
}
.headline-shadow::after {
  content: attr(data-text);
  position: absolute;
  left: 4px;
  top: 4px;
  color: var(--primary);
  -webkit-text-stroke: 0;
  z-index: -1;
  opacity: 0.25;
}
```

### Marquee ticker

```html
<div class="overflow-hidden border-y border-border bg-foreground py-2.5">
  <div class="flex whitespace-nowrap animate-[scroll_28s_linear_infinite]">
    <!-- Repetir 4x para loop suave -->
    <span class="font-mono text-[11px] tracking-widest text-background opacity-70 px-2">
      ITEM A · ITEM B · ITEM C ·&nbsp;
    </span>
    <!-- × 3 mais... -->
  </div>
</div>

<style>
@keyframes scroll {
  to { transform: translateX(-50%); }
}
</style>
```

### Composição geométrica decorativa

```html
<!-- Círculo grande com borda -->
<div class="absolute w-80 h-80 border-2 border-primary/20 rounded-full" />

<!-- Círculo pequeno sólido -->
<div class="absolute w-16 h-16 bg-foreground rounded-full top-10 right-10" />

<!-- Retângulo colorido rotacionado -->
<div class="absolute w-32 h-12 bg-destructive -rotate-8 bottom-20 left-8" />

<!-- Linhas finas de grid -->
<div class="absolute inset-0 opacity-[0.06]">
  <div class="absolute left-1/2 top-0 bottom-0 w-px bg-foreground" />
  <div class="absolute top-1/2 left-0 right-0 h-px bg-foreground" />
</div>
```

### Cursor customizado

```typescript
// useEffect em client component
const onMove = (e: MouseEvent) => {
  cursorEl.style.transform = `translate(${e.clientX - 12}px, ${e.clientY - 12}px)`;
};
```

```css
/* Cursor */
.custom-cursor {
  position: fixed;
  top: 0; left: 0;
  width: 24px; height: 24px;
  border: 2px solid var(--foreground);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transition: width .2s, height .2s, background .2s;
  will-change: transform;
}
.custom-cursor--hover {
  width: 40px; height: 40px;
  background: var(--primary);
  border-color: var(--primary);
  margin: -8px 0 0 -8px;
}
/* Esconder cursor nativo */
* { cursor: none; }
@media (max-width: 768px) {
  * { cursor: auto; }
  .custom-cursor { display: none; }
}
```

### Scroll reveal

```typescript
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) {
      (e.target as HTMLElement).style.opacity = "1";
      (e.target as HTMLElement).style.transform = "translateY(0)";
      io.unobserve(e.target);
    }
  }),
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
```

```css
.reveal {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity .7s cubic-bezier(.16,1,.3,1),
              transform .7s cubic-bezier(.16,1,.3,1);
}
```

---

## 8. Layout de Página Pública (Landing / Login)

### Hero 100vh

```
┌─────────────────────────────────────────────┐
│  [NAV: logo | links | CTA button]           │  sticky, h-16
├─────────────────────────────────────────────┤
│                                             │
│  [TEXTO grande: 60%]   [GEO: 40%]          │  main, flex-1
│                                             │
│  Subtítulo 15px max-w-xs                    │
│  [BTN FILL]  [BTN OUTLINE]                  │
├─────────────────────────────────────────────┤
│  [stat] / [stat] / [stat]                   │  border-top, flex
├─────────────────────────────────────────────┤
│  [MARQUEE TICKER ────────────────────────]  │
└─────────────────────────────────────────────┘
```

### Login split-screen

```
┌──────────────────────┬───────────────────────┐
│                      │                       │
│  HEADLINE GIGANTE    │   FORMULÁRIO          │
│  em Poppins 900      │   limpo e minimal     │
│                      │                       │
│  Elementos geo       │   Labels monospace    │
│  decorativos         │   Inputs border-2     │
│                      │   Botões uppercase    │
│  [← Voltar]          │                       │
└──────────────────────┴───────────────────────┘
  border-right: 1px     flex-1, items-center
```

---

## 9. CSS Global Completo (copiar e colar)

```css
/* Tailwind v4 + shadcn */
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --font-sans: var(--font-poppins, sans-serif);
  --font-mono: var(--font-space-mono, monospace);
  --radius-sm: 0px; --radius-md: 0px; --radius-lg: 0px;
  --radius-xl: 0px; --radius-2xl: 0px; --radius-3xl: 0px;
  /* ... mapeamentos de cor */
}

:root {
  --radius: 0rem;
  --background:    oklch(0.962 0.008 75);
  --foreground:    oklch(0.092 0.008 65);
  --card:          oklch(0.938 0.010 75);
  --primary:       oklch(0.720 0.128 78);   /* mustard #C8A431 */
  --destructive:   oklch(0.570 0.200 25);   /* red #D93025 */
  --border:        oklch(0.860 0.012 75);
  --muted:         oklch(0.920 0.010 75);
  --muted-foreground: oklch(0.480 0.015 70);
}

.dark {
  --background:    oklch(0.082 0.008 65);   /* #0D0B08 */
  --foreground:    oklch(0.962 0.008 75);   /* #F5F0E8 */
  --card:          oklch(0.108 0.010 65);
  --primary:       oklch(0.720 0.128 78);   /* mustard — mesmo no dark */
  --destructive:   oklch(0.570 0.200 25);
  --border:        oklch(0.200 0.012 65);   /* #231F15 */
  --muted:         oklch(0.145 0.010 65);
  --muted-foreground: oklch(0.500 0.015 70);
  --sidebar:       oklch(0.092 0.010 65);
}

@layer base {
  * {
    border-radius: 0 !important;
    @apply border-border;
  }
  .rounded-full { border-radius: 9999px !important; }

  body {
    @apply bg-background text-foreground;
    font-family: var(--font-poppins, sans-serif);
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    letter-spacing: -0.025em;
  }
}

::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: oklch(0.25 0.010 65); }
```

---

## 10. Anti-padrões — O que NUNCA fazer

| ❌ Proibido | ✅ Retro-Modern |
|---|---|
| `rounded-md` em botões | `rounded-none` ou sem classe |
| `box-shadow: 0 4px 6px rgba(0,0,0,0.1)` | `border: 1px solid var(--border)` |
| Branco puro `#ffffff` | Off-white `#F5F0E8` |
| Preto puro `#000000` | Warm black `#0D0B08` |
| Gradientes de fundo | Cores sólidas + grain texture |
| Fonte system (Arial, sans-serif) | Poppins + Space Mono |
| Todas seções mesma altura | Alturas variadas e dramáticas |
| Espaçamento uniforme | Contraste de escala intencional |
| `color: green` para positivo | `oklch(0.640 0.130 145)` warm green |
| Ícone em toda nav item sem número | Número editorial (01–07) + ícone |
| Hover com `opacity: 0.7` | Hover com troca de cor sólida |
| Border-radius 8px em inputs | `border-radius: 0`, `border-width: 2px` |

---

## 11. Checklist ao Iniciar Novo Projeto

- [ ] Importar Poppins (400, 500, 600, 700, 900) + Space Mono (400, 700)
- [ ] Definir `--radius: 0` no `:root`
- [ ] Configurar paleta com hue quente (hue 65–78 para warm black/white)
- [ ] Definir `--primary` como mostarda `oklch(0.720 0.128 78)`
- [ ] Aplicar `border-radius: 0 !important` no `* {}` global
- [ ] Reexcepcionar `.rounded-full` para avatars
- [ ] Configurar sidebar com numeração editorial
- [ ] Usar `border-top: 2px solid var(--primary)` em cards de destaque
- [ ] Label de seção em Space Mono 10px uppercase tracking-widest
- [ ] Botões: uppercase, font-weight 700, letter-spacing 0.08em
- [ ] Nunca usar `box-shadow` genérico — preferir bordas visíveis
- [ ] Scrollbar customizada: 4px, sem track, thumb warm gray

---

*Este sistema foi desenvolvido e refinado no projeto **Another Finance App** (2026).*
*Stack de referência: Next.js 16 + Tailwind v4 + shadcn/ui + Poppins + Space Mono.*
