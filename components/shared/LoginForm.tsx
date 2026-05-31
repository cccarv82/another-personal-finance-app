"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/callback` },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else setSent(true);
  }

  async function handleGoogle() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/callback` },
    });
    if (error) { setLoading(false); toast.error(error.message); }
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
          Email enviado
        </p>
        <h2 className="font-black text-3xl tracking-tighter">VERIFIQUE<br />SEU EMAIL.</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Link de acesso enviado para{" "}
          <span className="text-foreground font-medium">{email}</span>
        </p>
        <div className="border-t border-border pt-4">
          <Button variant="ghost" size="sm" onClick={() => setSent(false)} className="font-mono text-xs uppercase tracking-wider px-0">
            ← Usar outro email
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-4">
          Acesso à conta
        </p>
        <h2 className="font-black text-4xl tracking-tighter leading-none">
          ENTRAR
        </h2>
        <p className="text-sm text-muted-foreground mt-3">
          Sem senha. Acesso via link ou Google.
        </p>
      </div>

      {/* Google */}
      <Button
        variant="outline"
        className="w-full font-semibold tracking-wide border-2 h-11"
        onClick={handleGoogle}
        disabled={loading}
      >
        <svg className="w-4 h-4 mr-2.5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continuar com Google
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">ou</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Magic link */}
      <form onSubmit={handleMagicLink} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="h-11 text-sm border-2 font-mono"
          />
        </div>
        <Button
          type="submit"
          className="w-full h-11 font-bold tracking-wider uppercase text-xs"
          disabled={loading || !email}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Enviar link de acesso →
        </Button>
      </form>
    </motion.div>
  );
}
