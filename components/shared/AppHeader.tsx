"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Bell, LogOut, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AddTransactionButton } from "@/components/transactions/AddTransactionButton";
import Link from "next/link";

export function AppHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="flex items-center gap-3 px-4 md:px-6 h-14 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40 shrink-0">
      {/* Mobile logo */}
      <div className="md:hidden flex items-center gap-2 mr-auto">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
      </div>

      <div className="flex-1 hidden md:block" />

      {/* Search */}
      <div className="hidden md:flex items-center">
        {searchOpen ? (
          <Input
            autoFocus
            placeholder="Buscar transações..."
            className="w-64 h-8 text-sm"
            onBlur={() => setSearchOpen(false)}
          />
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSearchOpen(true)}>
            <Search className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* AI shortcut */}
      <Button variant="ghost" size="sm" className="hidden md:flex gap-1.5 text-xs" asChild>
        <Link href="/ai">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Consultor IA
        </Link>
      </Button>

      {/* Add transaction */}
      <AddTransactionButton />

      {/* Profile */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/20 text-primary text-xs">U</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
