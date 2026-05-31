"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, LogOut, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AddTransactionButton } from "@/components/transactions/AddTransactionButton";
import Link from "next/link";

const PAGE_LABELS: Record<string, string> = {
  "/dashboard":    "Dashboard",
  "/transactions": "Transações",
  "/accounts":     "Contas",
  "/goals":        "Metas",
  "/ai":           "Consultor IA",
  "/reports":      "Relatórios",
  "/settings":     "Configurações",
};

export function AppHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  const pageLabel = Object.entries(PAGE_LABELS).find(([k]) =>
    pathname === k || (k !== "/dashboard" && pathname.startsWith(k))
  )?.[1] ?? "";

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="flex items-center gap-3 px-4 md:px-6 h-14 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40 shrink-0">
      {/* Mobile logo */}
      <div className="md:hidden flex items-center gap-2 mr-auto">
        <div
          className="w-5 h-5 bg-primary shrink-0"
          style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
        />
        <span className="font-black text-sm tracking-tight uppercase">
          Fin<span className="text-primary">App</span>
        </span>
      </div>

      {/* Current page label — desktop only */}
      <span className="hidden md:block font-mono text-[10px] tracking-widest uppercase text-muted-foreground/50 select-none">
        {pageLabel}
      </span>

      <div className="flex-1" />

      {/* Search */}
      <div className="hidden md:flex items-center">
        {searchOpen ? (
          <Input
            autoFocus
            placeholder="Buscar transações..."
            className="w-56 h-8 text-sm font-mono"
            onBlur={() => setSearchOpen(false)}
          />
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSearchOpen(true)}>
            <Search className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {/* AI shortcut */}
      <Button variant="ghost" size="sm" className="hidden md:flex gap-1.5 text-[11px] font-mono uppercase tracking-wider" asChild>
        <Link href="/ai">
          <Sparkles className="w-3 h-3 text-primary" />
          IA
        </Link>
      </Button>

      {/* Theme toggle */}
      <ThemeToggle />

      {/* Add transaction */}
      <AddTransactionButton />

      {/* Profile */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-bold">U</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive text-xs font-mono uppercase tracking-wider">
            <LogOut className="w-3.5 h-3.5 mr-2" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
