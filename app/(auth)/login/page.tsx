import { LoginForm } from "@/components/shared/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 border-r border-border p-12 relative overflow-hidden">
        {/* Grain */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: "200px 200px",
          }}
        />

        {/* Logo */}
        <div className="flex items-center gap-2 relative z-10">
          <div
            className="w-5 h-5 bg-primary shrink-0"
            style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
          />
          <span className="font-black text-sm tracking-tight uppercase">
            Fin<span className="text-primary">App</span>
          </span>
        </div>

        {/* Headline */}
        <div className="relative z-10">
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground mb-6 uppercase">
            01 / Acesso
          </p>
          <h1
            className="font-black leading-none tracking-tighter text-foreground"
            style={{ fontSize: "clamp(64px, 7vw, 100px)", letterSpacing: "-0.04em" }}
          >
            DINHEIRO<br />
            <span className="text-primary">QUE VOCÊ</span><br />
            ENTENDE.
          </h1>
          <p className="mt-8 text-sm text-muted-foreground max-w-xs leading-relaxed">
            IA que lê seu extrato, identifica pontos de dor e fala sem rodeios.
          </p>
        </div>

        {/* Geometric decoration */}
        <div className="absolute right-[-60px] bottom-[-60px] w-64 h-64 border border-primary/20 rotate-12" />
        <div className="absolute right-12 bottom-12 w-12 h-12 bg-primary/20" />

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="font-mono text-[10px] tracking-widest text-muted-foreground hover:text-foreground transition-colors uppercase">
            ← Voltar
          </Link>
          <span className="font-mono text-[10px] tracking-widest text-muted-foreground/40">
            © 2026 FINAPP
          </span>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div
              className="w-5 h-5 bg-primary shrink-0"
              style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
            />
            <span className="font-black text-sm tracking-tight uppercase">
              Fin<span className="text-primary">App</span>
            </span>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
