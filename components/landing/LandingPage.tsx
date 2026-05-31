"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Poppins, Space_Mono } from "next/font/google";

const poppins = Poppins({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

export function LandingPage() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    /* ─── Custom cursor ─── */
    const onMove = (e: MouseEvent) => {
      cursor.style.transform = `translate(${e.clientX - 12}px, ${e.clientY - 12}px)`;
    };
    document.addEventListener("mousemove", onMove);

    const onEnter = () => cursor.classList.add("ld-cursor--hover");
    const onLeave = () => cursor.classList.remove("ld-cursor--hover");
    document.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    /* ─── Scroll reveal ─── */
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).style.opacity = "1";
            (e.target as HTMLElement).style.transform = "translateY(0)";
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".ld-reveal").forEach((el) => io.observe(el));

    /* ─── Nav on scroll ─── */
    const nav = document.getElementById("ld-nav");
    const onScroll = () => {
      nav?.classList.toggle("ld-nav--scrolled", window.scrollY > 48);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    /* ─── Hero parallax ─── */
    const onParallax = () => {
      const geo = document.getElementById("ld-geo");
      if (geo) geo.style.transform = `translateY(${window.scrollY * 0.12}px)`;
    };
    window.addEventListener("scroll", onParallax, { passive: true });

    return () => {
      document.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onParallax);
      document.querySelectorAll("a, button").forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
      io.disconnect();
    };
  }, []);

  return (
    <div className={`ld ${poppins.variable} ${spaceMono.variable}`}>
      <style>{STYLES}</style>

      {/* Custom cursor */}
      <div ref={cursorRef} className="ld-cursor" />

      {/* ────────────────────────────────── NAV */}
      <nav id="ld-nav" className="ld-nav">
        <div className="ld-nav__inner">
          <a href="#" className="ld-logo">
            <span className="ld-logo__mark" />
            FINAPP
          </a>
          <div className="ld-nav__links">
            <a href="#features">Features</a>
            <a href="#ai">IA</a>
            <a href="#como">Como funciona</a>
          </div>
          <Link href="/login" className="ld-btn ld-btn--nav">
            Entrar →
          </Link>
        </div>
      </nav>

      {/* ────────────────────────────────── HERO */}
      <section className="ld-hero">
        <div className="ld-grain" />

        <div className="ld-hero__inner">
          {/* Left: typography */}
          <div className="ld-hero__copy">
            <span className="ld-tag">◆ CONTROLE FINANCEIRO REAL</span>
            <h1 className="ld-hero__h1">
              <span className="ld-line ld-line--1">DINHEIRO</span>
              <span className="ld-line ld-line--2">NÃO</span>
              <span className="ld-line ld-line--3">MENTE.</span>
            </h1>
            <p className="ld-hero__sub">
              Finalmente um app que não te ilude com gráficos bonitos.<br />
              IA direta, dados reais, planos que funcionam.
            </p>
            <div className="ld-hero__ctas">
              <Link href="/login" className="ld-btn ld-btn--fill">
                COMEÇAR GRÁTIS
              </Link>
              <a href="#features" className="ld-btn ld-btn--outline">
                VER COMO FUNCIONA ↓
              </a>
            </div>
          </div>

          {/* Right: geometric composition */}
          <div id="ld-geo" className="ld-geo">
            <div className="ld-geo__circle-lg" />
            <div className="ld-geo__circle-sm" />
            <div className="ld-geo__rect" />
            <div className="ld-geo__cross" />
            <div className="ld-geo__line ld-geo__line--1" />
            <div className="ld-geo__line ld-geo__line--2" />
            <span className="ld-geo__label">AI ✦ 2026</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="ld-hero__stats">
          <div className="ld-stat">
            <span className="ld-stat__n">5+</span>
            <span className="ld-stat__l">bancos suportados</span>
          </div>
          <div className="ld-stat__sep" />
          <div className="ld-stat">
            <span className="ld-stat__n">100%</span>
            <span className="ld-stat__l">dados privados</span>
          </div>
          <div className="ld-stat__sep" />
          <div className="ld-stat">
            <span className="ld-stat__n">IA</span>
            <span className="ld-stat__l">análise inteligente</span>
          </div>
        </div>

        {/* Marquee */}
        <div className="ld-marquee">
          <div className="ld-marquee__track">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="ld-marquee__item">
                CONTROLE TOTAL&nbsp;·&nbsp;IA INTEGRADA&nbsp;·&nbsp;ANÁLISE REAL&nbsp;·&nbsp;PONTOS DE DOR&nbsp;·&nbsp;METAS FINANCEIRAS&nbsp;·&nbsp;IMPORT CSV&nbsp;·&nbsp;HEALTH SCORE&nbsp;·&nbsp;
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────── 02 PROBLEMA */}
      <section className="ld-problem" id="problema">
        <div className="ld-container">
          <div className="ld-section-head ld-reveal">
            <span className="ld-section-num">02</span>
            <h2 className="ld-section-h2">
              O problema não é<br />
              <em>gastar.</em> É não saber<br />
              onde vai.
            </h2>
          </div>
          <div className="ld-problem__grid">
            {[
              {
                n: "01",
                title: "Dinheiro desaparece",
                desc: "Fim do mês chega e o saldo não fecha. Você sabe que gastou, mas não sabe com o quê.",
              },
              {
                n: "02",
                title: "Gráficos bonitos, zero clareza",
                desc: "Outros apps mostram tortas coloridas que não dizem nada. Você precisa de diagnóstico, não de arte.",
              },
              {
                n: "03",
                title: "Sem plano para o próximo mês",
                desc: "Sem saber seu ponto de dor, como criar um plano? Seu próximo mês vai ser igual ao anterior.",
              },
            ].map((c) => (
              <div key={c.n} className="ld-problem__card ld-reveal">
                <span className="ld-card-num">{c.n}</span>
                <h3 className="ld-card-title">{c.title}</h3>
                <p className="ld-card-desc">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────── 03 AI */}
      <section className="ld-ai" id="ai">
        <div className="ld-ai__inner">
          <div className="ld-ai__copy ld-reveal">
            <span className="ld-section-num ld-section-num--light">03</span>
            <h2 className="ld-ai__h2">
              IA que fala a<br />
              verdade sobre<br />
              <span className="ld-ai__accent">suas finanças.</span>
            </h2>
            <ul className="ld-ai__list">
              {[
                "Detecta pontos de dor com dados reais",
                "Calcula impacto anual de cada hábito",
                "Relatório mensal sem eufemismos",
                "Chat 24h com contexto financeiro completo",
              ].map((item) => (
                <li key={item}>
                  <span>→</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="ld-terminal ld-reveal">
            <div className="ld-terminal__header">
              <span className="ld-dot ld-dot--r" />
              <span className="ld-dot ld-dot--y" />
              <span className="ld-dot ld-dot--g" />
              <span className="ld-terminal__title">consultor_ia.exe</span>
            </div>
            <div className="ld-terminal__body">
              <p>
                <span className="ld-t-prompt">›</span> Analisando 4 meses de extrato...
              </p>
              <p className="ld-t-label">PONTO DE DOR #1</p>
              <p className="ld-t-text">
                Fatura do cartão engole{" "}
                <span className="ld-t-warn">38%</span> da sua renda
              </p>
              <p className="ld-t-sub">
                Impacto anual:{" "}
                <span className="ld-t-danger">-R$ 52.000</span>
              </p>
              <br />
              <p className="ld-t-label">PONTO DE DOR #2</p>
              <p className="ld-t-text">
                iFood drena{" "}
                <span className="ld-t-warn">R$ 270/mês</span>
              </p>
              <p className="ld-t-sub">
                Impacto anual:{" "}
                <span className="ld-t-danger">-R$ 3.240</span>
              </p>
              <br />
              <p>
                <span className="ld-t-prompt">›</span>{" "}
                <span className="ld-t-cursor">_</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────── 04 FEATURES */}
      <section className="ld-features" id="features">
        <div className="ld-container">
          <div className="ld-section-head ld-reveal">
            <span className="ld-section-num">04</span>
            <h2 className="ld-section-h2">
              Tudo que você<br />
              precisa. Nada<br />que não precisa.
            </h2>
          </div>
          <div className="ld-features__grid">
            {[
              {
                n: "01",
                icon: "↑↓",
                title: "Import automático",
                desc: "Suporte a Itaú, Nubank, Bradesco, Inter e C6. Auto-categorização com IA integrada.",
              },
              {
                n: "02",
                icon: "◎",
                title: "Health Score",
                desc: "Pontuação financeira em tempo real: poupança, controle, diversificação e estabilidade de renda.",
              },
              {
                n: "03",
                icon: "◆",
                title: "Metas financeiras",
                desc: "Defina objetivos com prazo. Calculadora de quanto economizar por mês para chegar lá.",
              },
              {
                n: "04",
                icon: "→",
                title: "Consultor IA",
                desc: "Chat com Claude AI que tem acesso aos seus dados reais. Respostas diretas, sem rodeios.",
              },
              {
                n: "05",
                icon: "▦",
                title: "Relatórios reais",
                desc: "DNA de gastos por categoria. Evolução histórica. Comparativo mensal sem achismos.",
              },
              {
                n: "06",
                icon: "⊕",
                title: "Multi-conta",
                desc: "Gerencie corrente, poupança, investimentos e carteiras em um único lugar.",
              },
            ].map((f) => (
              <div key={f.n} className="ld-feature ld-reveal">
                <div className="ld-feature__top">
                  <span className="ld-feature__icon">{f.icon}</span>
                  <span className="ld-feature__n">{f.n}</span>
                </div>
                <h3 className="ld-feature__title">{f.title}</h3>
                <p className="ld-feature__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────── 05 CTA */}
      <section className="ld-cta" id="como">
        <div className="ld-cta__geo">
          <div className="ld-cta__circle" />
          <div className="ld-cta__rect" />
        </div>
        <div className="ld-cta__inner ld-reveal">
          <span className="ld-tag ld-tag--dark">◆ COMECE AGORA</span>
          <h2 className="ld-cta__h2">
            CHEGA DE<br />ADIVINHAR.
          </h2>
          <p className="ld-cta__sub">
            Conecte seu banco. Deixe a IA trabalhar.<br />
            Entenda seu dinheiro de verdade.
          </p>
          <Link href="/login" className="ld-btn ld-btn--fill ld-btn--xl">
            CRIAR CONTA GRÁTIS →
          </Link>
        </div>
      </section>

      {/* ────────────────────────────────── FOOTER */}
      <footer className="ld-footer">
        <div className="ld-footer__top">
          <div className="ld-footer__brand">
            <span className="ld-footer__logo">FINAPP</span>
            <p className="ld-footer__tagline">Finanças com inteligência real.</p>
          </div>
          <div className="ld-footer__links">
            <div className="ld-footer__col">
              <span className="ld-footer__col-title">PRODUTO</span>
              <a href="#features">Features</a>
              <a href="#ai">IA Integrada</a>
              <a href="#problema">O Problema</a>
            </div>
            <div className="ld-footer__col">
              <span className="ld-footer__col-title">CONTA</span>
              <Link href="/login">Entrar</Link>
              <Link href="/login">Criar conta</Link>
            </div>
          </div>
        </div>
        <div className="ld-footer__bottom">
          <span>© 2026 Another Finance App. Todos os direitos reservados.</span>
          <span>Construído com Claude AI ◆</span>
        </div>
        <div className="ld-marquee ld-marquee--footer">
          <div className="ld-marquee__track ld-marquee__track--rev">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="ld-marquee__item">
                ANOTHER FINANCE APP&nbsp;·&nbsp;CONTROLE REAL&nbsp;·&nbsp;IA INTEGRADA&nbsp;·&nbsp;SAÚDE FINANCEIRA&nbsp;·&nbsp;DADOS PRIVADOS&nbsp;·&nbsp;
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   STYLES — scoped to .ld to avoid collisions with the app's Tailwind styles
   Palette (a): Off-white + Black + Mustard + Red
───────────────────────────────────────────────────────────────────────── */
const STYLES = `
/* ── Reset & tokens ── */
.ld {
  --bg:       #F5F0E8;
  --black:    #0D0D0D;
  --yellow:   #C8A431;
  --yellow-d: #A08525;
  --red:      #D93025;
  --cream:    #EDE8DC;
  --white:    #F9F6F0;
  --mono:     var(--font-space-mono), 'Courier New', monospace;
  --sans:     var(--font-poppins), sans-serif;

  font-family: var(--sans);
  background: var(--bg);
  color: var(--black);
  overflow-x: hidden;
  cursor: none;
}

/* ── Custom cursor ── */
.ld-cursor {
  position: fixed;
  top: 0; left: 0;
  width: 24px; height: 24px;
  border: 2px solid var(--black);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transition: width .2s, height .2s, background .2s, border-color .2s;
  will-change: transform;
}
.ld-cursor.ld-cursor--hover {
  width: 40px; height: 40px;
  background: var(--yellow);
  border-color: var(--yellow);
  margin-top: -8px; margin-left: -8px;
}

/* ── Grain texture ── */
.ld-grain {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: .045;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 200px 200px;
  z-index: 0;
}

/* ── Scroll reveal ── */
.ld-reveal {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1);
}

/* ── Shared layout ── */
.ld-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
}

/* ── Tags ── */
.ld-tag {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--black);
  opacity: .55;
  display: block;
  margin-bottom: 20px;
}
.ld-tag--dark { color: var(--bg); opacity: .7; }

/* ── Section numbers ── */
.ld-section-num {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: .14em;
  opacity: .35;
  display: block;
  margin-bottom: 16px;
}
.ld-section-num--light { color: var(--bg); }

/* ────────────────── NAV ── */
.ld-nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  transition: background .3s, border-bottom .3s;
}
.ld-nav--scrolled {
  background: rgba(245,240,232,.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(13,13,13,.1);
}
.ld-nav__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 48px;
}
.ld-logo {
  font-family: var(--sans);
  font-weight: 900;
  font-size: 18px;
  letter-spacing: -.03em;
  color: var(--black);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.ld-logo__mark {
  width: 10px; height: 10px;
  background: var(--yellow);
  display: inline-block;
  transform: rotate(45deg);
}
.ld-nav__links {
  display: flex;
  gap: 32px;
  flex: 1;
}
.ld-nav__links a {
  font-size: 13px;
  font-weight: 500;
  color: var(--black);
  text-decoration: none;
  opacity: .6;
  position: relative;
  transition: opacity .2s;
}
.ld-nav__links a::after {
  content: '';
  position: absolute;
  bottom: -2px; left: 0; right: 100%;
  height: 1px;
  background: var(--black);
  transition: right .25s cubic-bezier(.16,1,.3,1);
}
.ld-nav__links a:hover { opacity: 1; }
.ld-nav__links a:hover::after { right: 0; }

/* ── Buttons ── */
.ld-btn {
  font-family: var(--sans);
  font-weight: 700;
  font-size: 12px;
  letter-spacing: .08em;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all .2s;
  cursor: none;
  border-radius: 0;
}
.ld-btn--nav {
  border: 1.5px solid var(--black);
  color: var(--black);
  padding: 8px 18px;
}
.ld-btn--nav:hover {
  background: var(--black);
  color: var(--bg);
}
.ld-btn--fill {
  background: var(--black);
  color: var(--bg);
  border: 2px solid var(--black);
  padding: 14px 28px;
}
.ld-btn--fill:hover {
  background: var(--yellow);
  border-color: var(--yellow);
  color: var(--black);
}
.ld-btn--outline {
  border: 2px solid var(--black);
  color: var(--black);
  padding: 14px 28px;
}
.ld-btn--outline:hover {
  background: var(--black);
  color: var(--bg);
}
.ld-btn--xl {
  font-size: 14px;
  padding: 18px 40px;
}

/* ────────────────── HERO ── */
.ld-hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg);
}
.ld-hero__inner {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  max-width: 1280px;
  margin: 0 auto;
  padding: 120px 32px 40px;
  width: 100%;
  align-items: center;
  position: relative;
  z-index: 1;
}
.ld-hero__copy { position: relative; }

/* Hero headline */
.ld-hero__h1 {
  display: flex;
  flex-direction: column;
  font-weight: 900;
  line-height: .92;
  letter-spacing: -.04em;
  margin: 0 0 32px;
  font-size: clamp(72px, 10vw, 148px);
}
.ld-line { display: block; }
.ld-line--1 { color: var(--black); }
.ld-line--2 {
  color: var(--yellow);
  -webkit-text-stroke: 2px var(--yellow-d);
}
.ld-line--3 {
  color: transparent;
  -webkit-text-stroke: 3px var(--black);
  position: relative;
}
.ld-line--3::after {
  content: 'MENTE.';
  position: absolute;
  left: 4px;
  top: 4px;
  color: var(--yellow);
  -webkit-text-stroke: 0;
  z-index: -1;
  opacity: .25;
}

.ld-hero__sub {
  font-size: 15px;
  line-height: 1.65;
  opacity: .6;
  margin: 0 0 36px;
  max-width: 380px;
  font-weight: 400;
}
.ld-hero__ctas {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

/* Hero geometric */
.ld-geo {
  position: relative;
  height: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ld-geo__circle-lg {
  width: 320px; height: 320px;
  border: 3px solid var(--yellow);
  border-radius: 50%;
  position: absolute;
  animation: ld-spin 24s linear infinite;
}
.ld-geo__circle-sm {
  width: 80px; height: 80px;
  background: var(--black);
  border-radius: 50%;
  position: absolute;
  top: 60px; right: 60px;
}
.ld-geo__rect {
  width: 120px; height: 48px;
  background: var(--red);
  position: absolute;
  bottom: 100px; left: 40px;
  transform: rotate(-8deg);
}
.ld-geo__cross {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
}
.ld-geo__cross::before,
.ld-geo__cross::after {
  content: '';
  position: absolute;
  background: var(--black);
}
.ld-geo__cross::before { width: 2px; height: 60px; top: -30px; left: -1px; }
.ld-geo__cross::after  { width: 60px; height: 2px; left: -30px; top: -1px; }

.ld-geo__line {
  position: absolute;
  background: var(--black);
  opacity: .12;
}
.ld-geo__line--1 { width: 1px; height: 100%; left: 50%; }
.ld-geo__line--2 { width: 100%; height: 1px; top: 50%; }

.ld-geo__label {
  position: absolute;
  bottom: 20px; right: 0;
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: .16em;
  opacity: .35;
}

@keyframes ld-spin {
  to { transform: rotate(360deg); }
}

/* Hero stats */
.ld-hero__stats {
  display: flex;
  align-items: center;
  gap: 0;
  max-width: 1280px;
  margin: 0 auto;
  padding: 28px 32px;
  border-top: 1px solid rgba(13,13,13,.12);
  width: 100%;
  position: relative;
  z-index: 1;
}
.ld-stat { text-align: left; padding: 0 40px 0 0; }
.ld-stat__n {
  display: block;
  font-weight: 900;
  font-size: 28px;
  letter-spacing: -.03em;
  line-height: 1;
}
.ld-stat__l {
  display: block;
  font-size: 11px;
  opacity: .5;
  margin-top: 4px;
  font-family: var(--mono);
  letter-spacing: .08em;
}
.ld-stat__sep {
  width: 1px;
  height: 40px;
  background: var(--black);
  opacity: .15;
  margin-right: 40px;
}

/* ────────────────── MARQUEE ── */
.ld-marquee {
  border-top: 1.5px solid var(--black);
  border-bottom: 1.5px solid var(--black);
  overflow: hidden;
  background: var(--black);
  padding: 10px 0;
}
.ld-marquee--footer {
  border-color: rgba(245,240,232,.15);
  background: transparent;
  padding: 12px 0;
  margin-top: 32px;
}
.ld-marquee__track {
  display: flex;
  white-space: nowrap;
  animation: ld-scroll 28s linear infinite;
  width: max-content;
}
.ld-marquee__track--rev {
  animation-direction: reverse;
}
.ld-marquee__item {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: .14em;
  color: var(--bg);
  padding: 0 8px;
  opacity: .7;
}
.ld-marquee--footer .ld-marquee__item {
  color: rgba(245,240,232,.35);
}
@keyframes ld-scroll {
  to { transform: translateX(-50%); }
}

/* ────────────────── 02 PROBLEM ── */
.ld-problem {
  padding: 120px 0;
  background: var(--cream);
  position: relative;
  overflow: hidden;
}
.ld-problem::before {
  content: '02';
  position: absolute;
  right: -20px; top: 40px;
  font-weight: 900;
  font-size: 240px;
  line-height: 1;
  letter-spacing: -.06em;
  opacity: .04;
  pointer-events: none;
  color: var(--black);
}
.ld-section-head {
  display: grid;
  grid-template-columns: 80px 1fr;
  align-items: start;
  gap: 24px;
  margin-bottom: 72px;
}
.ld-section-h2 {
  font-weight: 900;
  font-size: clamp(40px, 5.5vw, 80px);
  letter-spacing: -.03em;
  line-height: .95;
}
.ld-section-h2 em {
  font-style: normal;
  color: var(--yellow-d);
  -webkit-text-stroke: 1px var(--yellow-d);
}
.ld-problem__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5px;
  background: rgba(13,13,13,.12);
}
.ld-problem__card {
  background: var(--cream);
  padding: 40px 32px;
  position: relative;
}
.ld-problem__card:first-child { background: var(--black); }
.ld-problem__card:first-child .ld-card-title { color: var(--bg); }
.ld-problem__card:first-child .ld-card-desc { color: rgba(245,240,232,.6); }
.ld-problem__card:first-child .ld-card-num { color: var(--yellow); }
.ld-card-num {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: .16em;
  opacity: .4;
  display: block;
  margin-bottom: 20px;
}
.ld-card-title {
  font-weight: 700;
  font-size: 22px;
  letter-spacing: -.02em;
  margin: 0 0 14px;
  line-height: 1.1;
}
.ld-card-desc {
  font-size: 14px;
  line-height: 1.7;
  opacity: .6;
  margin: 0;
}

/* ────────────────── 03 AI ── */
.ld-ai {
  background: var(--black);
  padding: 140px 0;
  overflow: hidden;
}
.ld-ai__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}
.ld-ai__h2 {
  font-weight: 900;
  font-size: clamp(42px, 5.5vw, 80px);
  letter-spacing: -.04em;
  line-height: .93;
  color: var(--bg);
  margin: 0 0 40px;
}
.ld-ai__accent { color: var(--yellow); }
.ld-ai__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.ld-ai__list li {
  font-size: 15px;
  color: rgba(245,240,232,.7);
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.ld-ai__list li span {
  color: var(--yellow);
  font-weight: 700;
  flex-shrink: 0;
}

/* Terminal */
.ld-terminal {
  background: #111;
  border: 1.5px solid rgba(245,240,232,.08);
  font-family: var(--mono);
}
.ld-terminal__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(245,240,232,.06);
}
.ld-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.ld-dot--r { background: #ff5f57; }
.ld-dot--y { background: #ffbd2e; }
.ld-dot--g { background: #28c840; }
.ld-terminal__title {
  font-size: 11px;
  color: rgba(245,240,232,.3);
  letter-spacing: .1em;
  margin-left: auto;
}
.ld-terminal__body {
  padding: 24px;
  font-size: 13px;
  line-height: 1.8;
}
.ld-terminal__body p { margin: 0; }
.ld-t-prompt { color: var(--yellow); margin-right: 8px; }
.ld-t-label {
  color: rgba(245,240,232,.35);
  font-size: 10px;
  letter-spacing: .14em;
}
.ld-t-text { color: rgba(245,240,232,.8); font-size: 14px; }
.ld-t-sub { color: rgba(245,240,232,.4); font-size: 12px; }
.ld-t-warn { color: var(--yellow); font-weight: 700; }
.ld-t-danger { color: var(--red); font-weight: 700; }
.ld-t-cursor {
  display: inline-block;
  width: 8px; height: 14px;
  background: var(--yellow);
  animation: ld-blink .9s step-end infinite;
  vertical-align: middle;
}
@keyframes ld-blink { 50% { opacity: 0; } }

/* ────────────────── 04 FEATURES ── */
.ld-features {
  padding: 140px 0;
  background: var(--bg);
  position: relative;
}
.ld-features__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5px;
  background: rgba(13,13,13,.1);
}
.ld-feature {
  background: var(--bg);
  padding: 40px 32px;
  position: relative;
  transition: background .2s;
}
.ld-feature:hover { background: var(--cream); }
.ld-feature__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}
.ld-feature__icon {
  font-size: 24px;
  font-family: var(--mono);
  color: var(--yellow-d);
}
.ld-feature__n {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: .16em;
  opacity: .3;
}
.ld-feature__title {
  font-weight: 700;
  font-size: 20px;
  letter-spacing: -.02em;
  margin: 0 0 12px;
}
.ld-feature__desc {
  font-size: 13.5px;
  line-height: 1.7;
  opacity: .55;
  margin: 0;
}

/* ────────────────── 05 CTA ── */
.ld-cta {
  background: var(--yellow);
  padding: 140px 32px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ld-cta__geo {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.ld-cta__circle {
  position: absolute;
  right: -120px; top: -120px;
  width: 400px; height: 400px;
  border: 3px solid rgba(13,13,13,.12);
  border-radius: 50%;
}
.ld-cta__rect {
  position: absolute;
  left: -40px; bottom: -60px;
  width: 200px; height: 200px;
  background: rgba(13,13,13,.06);
  transform: rotate(20deg);
}
.ld-cta__inner {
  max-width: 720px;
  text-align: center;
  position: relative;
  z-index: 1;
}
.ld-cta__h2 {
  font-weight: 900;
  font-size: clamp(64px, 10vw, 148px);
  letter-spacing: -.05em;
  line-height: .88;
  color: var(--black);
  margin: 16px 0 28px;
}
.ld-cta__sub {
  font-size: 16px;
  line-height: 1.65;
  opacity: .65;
  margin: 0 0 40px;
}

/* ────────────────── FOOTER ── */
.ld-footer {
  background: var(--black);
  padding: 72px 32px 0;
}
.ld-footer__top {
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  padding-bottom: 64px;
  border-bottom: 1px solid rgba(245,240,232,.08);
}
.ld-footer__logo {
  display: block;
  font-weight: 900;
  font-size: 32px;
  letter-spacing: -.04em;
  color: var(--bg);
  margin-bottom: 12px;
}
.ld-footer__tagline {
  font-size: 13px;
  color: rgba(245,240,232,.4);
  margin: 0;
  font-family: var(--mono);
  letter-spacing: .06em;
}
.ld-footer__links {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
}
.ld-footer__col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.ld-footer__col-title {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: .16em;
  color: rgba(245,240,232,.3);
  margin-bottom: 6px;
}
.ld-footer__col a {
  font-size: 14px;
  color: rgba(245,240,232,.6);
  text-decoration: none;
  transition: color .2s;
}
.ld-footer__col a:hover { color: var(--bg); }
.ld-footer__bottom {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 0 28px;
  font-size: 12px;
  color: rgba(245,240,232,.25);
  font-family: var(--mono);
  letter-spacing: .06em;
}

/* ────────────────── MOBILE ── */
@media (max-width: 768px) {
  .ld-nav__links { display: none; }
  .ld-hero__inner {
    grid-template-columns: 1fr;
    padding-top: 100px;
    padding-bottom: 24px;
    gap: 40px;
  }
  .ld-geo { height: 260px; order: -1; }
  .ld-geo__circle-lg { width: 200px; height: 200px; }
  .ld-geo__circle-sm { width: 50px; height: 50px; top: 20px; right: 20px; }
  .ld-geo__rect { width: 80px; height: 32px; }
  .ld-hero__stats { flex-wrap: wrap; gap: 24px; }
  .ld-stat__sep { display: none; }
  .ld-problem__grid,
  .ld-features__grid { grid-template-columns: 1fr; }
  .ld-section-head { grid-template-columns: 1fr; gap: 8px; }
  .ld-ai__inner { grid-template-columns: 1fr; gap: 48px; }
  .ld-footer__top { grid-template-columns: 1fr; gap: 48px; }
  .ld-footer__bottom { flex-direction: column; gap: 8px; text-align: center; }
  .ld-hero__ctas { flex-direction: column; }
  .ld-btn--fill, .ld-btn--outline { text-align: center; justify-content: center; }
  .ld, .ld * { cursor: auto !important; }
  .ld-cursor { display: none; }
}
`;
