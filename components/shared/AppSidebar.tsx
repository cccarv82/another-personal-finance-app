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
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",    icon: LayoutDashboard, label: "Dashboard",     n: "01" },
  { href: "/transactions", icon: ArrowLeftRight,  label: "Transações",    n: "02" },
  { href: "/accounts",     icon: Wallet,          label: "Contas",        n: "03" },
  { href: "/goals",        icon: Target,          label: "Metas",         n: "04" },
  { href: "/ai",           icon: Bot,             label: "Consultor IA",  n: "05" },
  { href: "/reports",      icon: BarChart3,       label: "Relatórios",    n: "06" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-56 border-r border-border bg-sidebar shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border">
        <div
          className="w-5 h-5 bg-primary shrink-0"
          style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
        />
        <span className="font-black text-sm tracking-tight leading-none uppercase">
          Fin<span className="text-primary">App</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 flex flex-col gap-px">
        {navItems.map(({ href, icon: Icon, label, n }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 px-4 py-2.5 text-sm transition-colors relative",
                active
                  ? "bg-primary/10 text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {/* Active indicator */}
              {active && (
                <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
              )}
              {/* Editorial number */}
              <span
                className="text-[9px] tracking-widest font-mono shrink-0 w-5 text-right"
                style={{ opacity: active ? 0.4 : 0.25 }}
              >
                {n}
              </span>
              <Icon className={cn("w-3.5 h-3.5 shrink-0", active && "text-primary")} />
              <span className="tracking-tight">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Divider + Settings */}
      <div className="border-t border-border pb-4 pt-3">
        <Link
          href="/settings"
          className={cn(
            "group flex items-center gap-3 px-4 py-2.5 text-sm transition-colors relative",
            pathname === "/settings"
              ? "bg-primary/10 text-foreground font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          {pathname === "/settings" && (
            <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
          )}
          <span className="text-[9px] tracking-widest font-mono shrink-0 w-5 text-right opacity-25">
            07
          </span>
          <Settings className={cn("w-3.5 h-3.5 shrink-0", pathname === "/settings" && "text-primary")} />
          <span className="tracking-tight">Configurações</span>
        </Link>
      </div>
    </aside>
  );
}
