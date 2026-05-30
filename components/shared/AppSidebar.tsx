"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Target,
  Bot,
  BarChart3,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/transactions", icon: ArrowLeftRight, label: "Transações" },
  { href: "/accounts", icon: Wallet, label: "Contas" },
  { href: "/goals", icon: Target, label: "Metas" },
  { href: "/ai", icon: Bot, label: "Consultor IA" },
  { href: "/reports", icon: BarChart3, label: "Relatórios" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-56 border-r border-border bg-sidebar shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sm leading-tight">
          Another<br />Finance App
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", active && "text-primary")} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Settings at bottom */}
      <div className="px-2 pb-4">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
            pathname === "/settings"
              ? "bg-sidebar-accent text-sidebar-foreground font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          Configurações
        </Link>
      </div>
    </aside>
  );
}
